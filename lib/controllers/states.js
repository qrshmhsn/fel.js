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
		self.initial = options.initial_state;
		self.event_pattern = "state_manager.{0}.{1}";//0 - state name, 1 - event
		self.states = [];
		for(var state in options.states){
			var events_handler = options.states[state];
			if(_.isArray(events_handler))
				_.each(events_handler, function(eh){
					self.add_events_handler(state, eh);
				});
			else
				self.add_events_handler(state, events_handler);
			self.states.push(state);
		}
		self.shared = {};
		for(var sc_name in options.shared){
			var sc = options.shared[sc_name];
			if(_.isFunction(sc))
				sc = new sc();
			self.shared[sc_name] = sc;
		}
	},
	add_events_handler: function(state, events_handler, prefix){
		var self = this;
		if(events_handler.classname == "Controller")
			self.add_event_controller_handler(state, events_handler, prefix);
		else {
			self.add_event_handler(state, events_handler, prefix);
		}
	},
	add_event_controller_handler: function(state, controller, prefix){
		var self = this;
		if(_.isFunction(controller))
			controller = new controller();
		controller.state_manager = self;
		for(var event in controller){
			if(_.include(["class", "baseclass", "__init__", "__classvars__", "classname"], event))
				continue;
			//console.log(event, !_.include(["class", "baseclass", "__init__", "__classvars__"], event));
			var handler = controller[event];
			if(_.isString(handler))
				handler = self.direct_transition_func(handler);
			if(!_.isFunction(handler))
				continue;
			if(prefix && prefix != "")
				event = "{0}.{1}".f(prefix, event);
			var ev = self.event_pattern.f(state, event);
			self.eventer.on(ev, _.bind(handler, controller));
		}
	},
	add_event_handler: function(state, events_handler, prefix){
		var self = this;
		for(var ev in events_handler){
			var handler = events_handler[ev];
			if(prefix && prefix != "")
				ev = "{0}.{1}".f(prefix, ev);
			var event = self.event_pattern.f(state, ev);
			if(handler.classname == "Controller")
				self.add_event_controller_handler(state, handler, ev);
			else{
				if(_.isString(handler))
					handler = self.direct_transition_func(handler);
				if(_.isFunction(handler))
					self.eventer.on(event, handler);
				else
					self.add_events_handler(state, handler, ev);
			}
		}
	},
	direct_transition_func: function(next_state){
		return function(state_manager){ state_manager.transition(next_state); };
	},
	start: function(){
		var self = this;
		if(!self.initial && self.states.length > 0)
			self.initial = self.states[0];
		if(self.initial)
			self.transition(self.initial);
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
		var args = [event];
		var args = args.concat(_.rest(arguments));
		args.push(self);
		self.eventer.emit.apply(self.eventer, args);
	}
});

var Controller = SingletonObject.extend({
	__classvars__ : {
        classname: "Controller"
    }
});

exports.StateManager = StateManager;
exports.Controller = Controller;