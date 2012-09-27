var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;

var StateManager = SingletonObject.extend({
	__init__: function(app, options){
		var self = this;
		self.eventer = app.eventer;
		self.initial = options.initial;
		self.states = [];
		for(name in options){
			if(name == "initial")
				continue
			self.states.push(new State(self, name, options[name]));
		}
	},
	start: function(){
		this.transition(this.initial);
	},
	transition: function(to){
		var self = this;
		var next = self.get(to);
		if(self.current)
			self.current.exit();
		self.current = next;
		self.current.enter();
		
	},
	get: function(name){
		var self = this;
		for(i = 0; i < self.states.length; ++i){
			var s = self.states[i];
			if(s.name == name)
				return s;
		}
	},
	event: function(name){
		var self = this;
		self.eventer.emit(name);
		//console.log(name);
	}
});

var State = Object.extend({
	__init__: function(manager, name, events_handlers){
		var self = this;
		self.manager = manager;
		self.name = name;
		self.events_handlers = events_handlers;
		for(ev in self.events_handlers)
			self.manager.eventer.on(ev, self.events_handlers[ev]);
	},
	enter: function(){
		var self = this;
		if("enter" in self.events_handlers)
			self.events_handlers.enter();
	},
	exit: function(){
		var self = this;
		if("exit" in self.events_handlers)
			self.events_handlers.exit();
	}
});

exports.StateManager = StateManager;
exports.State = State;