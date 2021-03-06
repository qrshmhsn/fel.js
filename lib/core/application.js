var EventEmitter2 = require("eventemitter2").EventEmitter2;
var Viewer = require("../views").Viewer;
var Object = require("./types").Object;
var SingletonObject = require("./types").SingletonObject;
var StateManager = require("../controllers").StateManager;
var ModelsManager = require("../models").ModelsManager;
var _ = require("underscore");

var Application = SingletonObject.extend({
	__classvars__ : {
        classname: "Application"
    },
	start: function(options){
		var self = this;
		self.options = {
			views: {
				templates: {
					selector: 'script[type="text/x-template"]',
					name_attr: "data-name",
					tags: {},
					filters: {}
				},
				translations: {
					lang: "ru",
					source: {}
				}
			},
			controllers: {
				initial_state: null,
				states: {},
				shared: {} //controllers shared between states
			},
			events: {},
			models: {}
		};
		if(options)
			self.options = Object.merge(self.options, options);
		self.eventer = new EventEmitter2({wildcard: true});
		for(var ev in self.options.events)
			self.eventer.on(ev, self.options.events[ev]);
		self.eventer.emit("application.before_init", self);
		self.models_manager = new ModelsManager(self, self.options.models);
		self.viewer = new Viewer(self, self.options.views);
		self.state_manager = new StateManager(self, self.options.controllers);
		self.eventer.emit("application.after_init", self);
		self.state_manager.start();
		self.eventer.emit("application.after_start", self);
	}
});

exports.Application = Application;
