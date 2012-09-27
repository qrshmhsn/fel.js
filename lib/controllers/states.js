var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;

var StateManager = SingletonObject.extend({
	__init__: function(app, options){
		var self = this;
		self.eventer = app.eventer;
		self.initial = options.initial;
		self.event_pattern = "state_manager.{0}.{1}";//0 - state name, 1 - event
		self.states = [];
		for(name in options){
			if(name == "initial")
				continue
			var events_handlers = options[name];
			for(ev in events_handlers){
				var event = self.event_pattern.f(name, ev);
				//console.log(event);
				self.eventer.on(event, events_handlers[ev]);
			}
			self.states.push(name);
		}
	},
	start: function(){
		this.transition(this.initial);
	},
	get: function(name){
		var self = this;
		for(i = 0; i < self.states.length; ++i){
			var s = self.states[i];
			if(s == name)
				return s;
		}
	},
	transition: function(to){
		var self = this;
		var next = self.get(to);
		if(self.current)
			self.event("exit");
		self.current = next;
		self.event("enter");
		
	},
	event: function(name){
		var self = this;
		var event = self.event_pattern.f(self.current, name);
		self.eventer.emit(event, self);
	}
});

exports.StateManager = StateManager;