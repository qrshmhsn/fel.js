var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;
var _ = require("underscore");

var StateManager = SingletonObject.extend({
	__classvars__ : {
        classname: "StateManager"
    },
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
			if(events_handlers.classname == "Controller"){
				var controller = events_handlers;
				if(_.isFunction(controller))
					controller = new controller();
				for(event in controller){
					var handler = controller[event];
					var ev = self.event_pattern.f(name, event);
					if(_.isFunction(handler) && event != "class"){
						//console.log("ok", ev);
						self.eventer.on(ev, handler);
					}
				}
			}
			else {
				for(ev in events_handlers){
					var event = self.event_pattern.f(name, ev);
					var handler = events_handlers[ev];
					if(typeof handler == "string"){
						var next_state = handler;
						handler = function(state_manager){ state_manager.transition(next_state); };
					}
					self.eventer.on(event, handler);
				}
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

var Controller = SingletonObject.extend({
	__classvars__ : {
        classname: "Controller"
    }
});

exports.StateManager = StateManager;
exports.Controller = Controller;