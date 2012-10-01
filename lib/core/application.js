var EventEmitter2 = require("eventemitter2").EventEmitter2;
var Viewer = require("../views").Viewer;
var Object = require("./types").Object;
var SingletonObject = require("./types").SingletonObject;
var StateManager = require("../controllers").StateManager;

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
					name_attr: "data-name"
				},
				translations: {},
				lang: "ru",
				filters: {
					trans: function(input){
						return self.translator.translate(input);
					}
				}
			},
			events: {},
			states: {}
		};
		if(options)
			self.options = Object.merge(self.options, options);
		self.eventer = new EventEmitter2({wildcard: true});
		for(var ev in self.options.events)
			self.eventer.on(ev, self.options.events[ev]);
		self.eventer.emit("application.before_start", self);
		self.viewer = new Viewer(self, self.options.views);
		self.state_manager = new StateManager(self, self.options.states);
		self.state_manager.start();
		self.eventer.emit("application.after_start", self);
	}
});

exports.Application = Application;
