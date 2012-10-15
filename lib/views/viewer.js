var swig = require('swig');
var swig_helpers = require('swig/lib/helpers');
var views = require('../views');
var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;
var $ = require('br-jquery');

var Viewer = SingletonObject.extend({
	__classvars__ : {
        classname: "Viewer"
    },
	__init__: function(app, options){
		var self = this;
		self.eventer = app.eventer;
		self.eventer.emit("viewer.before_init", self);
		var beforeWrapFilters = swig_helpers.wrapFilters;
		swig_helpers.wrapFilters = function(variable, filters, context, escape){
		    if (filters && filters.length > 0) {
		        _.each(filters, function (filter) {
		        	if(filter.name == "binding"){
		        		escape = false;
		        	}
		        });
		    }
		    return beforeWrapFilters(variable, filters, context, escape);
		};
		swig.init({filters: options.templates.filters});
		self.templates = {};
		$(options.templates.selector).each(function(index, item){
			var el = $(item);
			var name = el.attr(options.templates.name_attr);
			var content = el.html();
			self.add_template(name, content);
		});
		self.translator = new views.Translator(options.translations);
		self.eventer.emit("viewer.after_init", self);
	},
	add_template: function(name, content){
		this.templates[name] = swig.compile(content, {filename: name});
	}
});

var View = Object.extend({
	__init__: function(name, context){
		var self = this;
		self.viewer = new Viewer();
		self.name = name;
		self.context = context;
		if(!self.context)
			self.context = {};
	},
	render: function(to) {
		if(!to)
			to = "body";
		$(to).html(this.toString());
	},
	prepend: function(to){
		if(!to)
			to = "body";
		$(to).prepend(this.toString());
	},
	append: function(to){
		if(!to)
			to = "body";
		$(to).append(this.toString());
	},
	toString: function(){
		var self = this;
		return self.viewer.templates[self.name](self.context);
	}
});

exports.Viewer = Viewer;
exports.View = View;
