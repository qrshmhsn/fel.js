var eventemitter2 = require("eventemitter2");
var views = require("../views");
var Object = require("./types").Object;
var Singleton = require("./oop").Singleton;

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
			events: {}
		};
		if(options)
			self.options = Object.merge(self.options, options);
		self.eventer = new eventemitter2.EventEmitter2({wildcard: true});
		for(ev in self.options.events)
			self.eventer.on(ev, self.options.events[ev]);
		self.eventer.emit("application.before_start", this);
		self.viewer = new views.Viewer(self, self.options.views);
		self.eventer.emit("application.after_start", this);
	}
});

exports.Application = Application;
