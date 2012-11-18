var templater = require("handlebars-browserify");
require("./tags");
var views = require('../views');
var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;
var $ = require('br-jquery');
var Metamorph = require("./metamorph").Metamorph;
var _ = require("underscore");

var Viewer = SingletonObject.extend({
	__classvars__ : {
        classname: "Viewer"
    },
	__init__: function(app, options){
		var self = this;
		self.app = app;
		self.eventer = app.eventer;
		self.options = options;
		self.eventer.emit("viewer.before_init", self);
		self.bindings = {};
		//bind tag
		//usage: {{bind "app.var1"}}
		//or: {{bind "app.var1" "class"}}
		templater.registerHelper("bind", function (variable, attr) {
			var result = self.bind(variable, attr);
		    return new templater.SafeString(result);
		});
		//usage: {{render "app.var1" "main"}}
		templater.registerHelper("render", function (variable, template) {
			var result = self.bind(variable, null, template);
		    return new templater.SafeString(result);
		});
		self.filters = {
			trans: function(input){ return self.translator.translate(input); },
			title: function(input){ return input.title(); },
			capital: function(input){ return input.capital(); },
			upper: function(input){ return input.toUpperCase(); },
			lower: function(input){ return input.toLowerCase(); }
		};
		templater.registerHelper("filters", function block(filters, options) {
		    var result = options.fn(this);
			if(filters && _.isString(filters) && result)
				_.each(filters.split(","), function(f){
					f = f.trim();
					if(_.has(self.filters, f))
						result = self.filters[f](result);
				});
		    return new templater.SafeString(result);
		});
		//trans tag
		//usage: {{trans "main"}}
		templater.registerHelper("trans", function extend(input, options) {
			var result = self.translator.translate(input);
			if(options.hash)
				var filters = options.hash.filters;
			if(filters && _.isString(filters))
				_.each(filters.split(","), function(f){
					f = f.trim();
					if(_.has(self.filters, f))
						result = self.filters[f](result);
				});
		    return new templater.SafeString(result);
		});
		for(var name in options.templates.tags){
			var tag = options.templates.tags[name];
			templater.registerHelper(name, tag); 
		}
		for(var name in options.templates.filters){
			var filter = options.templates.filters[name];
			self.filters[name] = filter;
		}
		self.refresh();
		self.translator = new views.Translator(options.translations);
		self.eventer.emit("viewer.after_init", self);
	},
	refresh: function(){
		var self = this;
		self.templates = {};
		$(self.options.templates.selector).each(function(index, item){
			var el = $(item);
			var name = el.attr(self.options.templates.name_attr);
			var source = el.html();
			self.add_template(name, source);
		});
	},
	add_template: function(name, source){
		var compiled = templater.compile(source);
		templater.registerPartial(name, compiled);
		this.templates[name] = compiled;
	},
	bind: function(variable, attr, template){
		var self = this;
		var parts = variable.split(".");
		first_part = parts[0];
		var last_part = null;
		if(parts.length > 1){
			first_part = _.initial(parts);
			last_part = _.last(parts);
			first_part = _.reduce(first_part, function(memo, part){ return memo + "." + part});
		}
		if(!self.bindings[variable])
			self.bindings[variable] = [];
		//watch changes in global object or controllers properties
		var root_obj = window;
		for(var i = 0; i < self.app.controllers.length; ++i){
			var c = self.app.controllers[i];
			if(first_part in c){
				root_obj = c;
				break;
			}
		}
		var result;
		if(attr && _.isString(attr)){
			var placeholder = "data-{0}".f(Object.unique4());
			var attribute = attr;
			result = " {0} {1}=''".f(placeholder, attribute);
			var updater = function(newval){
				$("[{0}]".f(placeholder)).each(function(){
					$(this).attr(attribute, newval);
				});
			};
			self.bindings[variable].push(updater);
		}
		else{
			var value = Object.prop(root_obj, variable);
			var morph = null;
			if(!template)
				morph = Metamorph(value);
			else {
				morph = Metamorph("");
				new View(template, value).toString(function(html){
					setTimeout(function(){ morph.html(html); }, 0); //wait for morph inserting
				});
			}
			result = morph.outerHTML();
			var updater = function(newval){
				if(!template)
					morph.html(newval);
				else
					new View(template, newval).toString(function(html){
						morph.html(html);
					});
			};
			self.bindings[variable].push(updater);
		}
		var watch_obj = Object.prop(root_obj, first_part);
		if(!last_part){
			watch_obj = root_obj;
			last_part = first_part;
		}
		watch_obj.watch(last_part, function(id, oldval, newval){
			_.each(self.bindings[variable], function(updater){
				updater(newval);
			});
		});
		return result;
	}
});

var View = Object.extend({
	__init__: function(name, context){
		var self = this;
		self.viewer = new Viewer();
		self.name = name;
		self.context = {};
		for (var prop in window)
			if(!prop.startsWith("_"))
		    	self.context[prop] = window[prop];
		if(context && _.isObject(context))
			self.context = Object.merge(self.context, context);
		else
			self.context.context = context;
		//self.context = context;
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
	after: function(target){
		$(target).after(this.toString());
	},
	before: function(target){
		$(target).before(this.toString());
	},
	toString: function(){
		return this.viewer.templates[this.name](this.context);
	}
});

exports.Viewer = Viewer;
exports.View = View;
