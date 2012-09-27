var EventEmitter2 = require("eventemitter2").EventEmitter2;
var Viewer = require("../views").Viewer;
var Object = require("./types").Object;
var Singleton = require("./oop").Singleton;
var StateManager = require("../controllers").StateManager;

var Application = Singleton.extend({
	start: function(options){
		var self = this;
		self.options = {
			views: {
				templates: {},
				translations: {},
				lang: "ru",
				filters: {
					trans: function(input){
						return self.translator.translate(input)
					}
				}
			},
			events: {},
			states: {}
		};
		if(options)
			self.options = Object.merge(self.options, options);
		self.eventer = new EventEmitter2({wildcard: true});
		for(ev in self.options.events)
			self.eventer.on(ev, self.options.events[ev]);
		self.eventer.emit("application.before_start", this);
		self.viewer = new Viewer(self, self.options.views);
		self.state_manager = new StateManager(self, self.options.states);
		self.eventer.emit("application.after_start", this);
		self.state_manager.start();
	}
});

exports.Application = Application;
