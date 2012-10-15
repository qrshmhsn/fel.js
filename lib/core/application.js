var EventEmitter2 = require("eventemitter2").EventEmitter2;
var Viewer = require("../views").Viewer;
var Object = require("./types").Object;
var SingletonObject = require("./types").SingletonObject;
var StateManager = require("../controllers").StateManager;
var ModelsManager = require("../models").ModelsManager;
var _ = require("underscore");
var Metamorph = require("../views").Metamorph;

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
					filters: {
						trans: function(input){
							return self.viewer.translator.translate(input);
						},
						binding: function(variable){
							var parts = variable.split(".");
							var first_part = _.initial(parts);
							var last_part = _.last(parts);
							first_part = _.reduce(first_part, function(memo, part){ return memo + "." + part});
							var morph = Metamorph(window[variable]);
							//watch changes in global object(we assume that this binding of global object)
							window[first_part].watch(last_part, function(id, oldval, newval){
								morph.html(newval);
							});
							return morph.outerHTML();
						}
					}
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
		self.viewer = new Viewer(self, self.options.views);
		self.models_manager = new ModelsManager(self, self.options.models);
		self.state_manager = new StateManager(self, self.options.controllers);
		self.eventer.emit("application.after_init", self);
		self.state_manager.start();
		self.eventer.emit("application.after_start", self);
	}
});

exports.Application = Application;
