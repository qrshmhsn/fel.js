var swig = require('swig');
var views = require('../views');
var Object = require("../core/types").Object;

var Viewer = Object.extend({
	__classvars__ : {
        classname: "Viewer"
    },
	__init__: function(app, options){
		var self = this;
		self.eventer = app.eventer;
		self.eventer.emit("viewer.before_start", self);
		swig.init({filters: options.filters});
		self.templates = {};
		for(name in options.templates)
			self.add_template(name, options.templates[name]);
		//translations
		app.translator = new views.Translator({lang: options.lang, translations: options.translations});
		self.eventer.emit("viewer.after_start", self);
	},
	add_template: function(name, content){
		this.templates[name] = swig.compile(content, {filename: name});
	}
});

exports.Viewer = Viewer;
