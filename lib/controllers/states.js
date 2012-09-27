var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;

var StateManager = SingletonObject.extend({
	__init__: function(app, options){
		var self = this;
		self.eventer = app.eventer;
		self.states = [];
		for(name in options){
			if(name == "initial")
				continue
			self.states.push(new State(self, name, options[name]));
		}
		self.current = self.get(options.initial);
	},
	transition: function(to){
		var self = this;
		var next = self.get(to);
		console.log("transition", self.current.name, next.name);
	},
	get: function(name){
		var self = this;
		for(i = 0; i < self.states.length; ++i){
			var s = self.states[i];
			if(s.name == name)
				return s;
		}
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
	transition: function(to){
		this.manager.transition(self, to);
	}
});

exports.StateManager = StateManager;
exports.State = State;