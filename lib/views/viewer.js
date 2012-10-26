require("dustjs-helpers");
var dust = require("dustjs-linkedin");
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
		self.eventer = app.eventer;
		self.eventer.emit("viewer.before_init", self);
		self.bindings = {};
		//bind tag
		//usage: {@bind v="app.var1"/}
		//or: {@bind v="app.var1" a="class"/}
		dust.helpers["bind"] = function(chunk, context, bodies, params){
			var variable = params.v;
			var attr = params.a;
			var result = self.bind(variable, attr);
			return chunk.write(result);
		};
		//trans tag
		//usage: {@trans value="main"/}
		dust.helpers["trans"] = function(chunk, context, bodies, params){
			var input = params.value;
			var filters = params.filters;
			var result = self.translator.translate(input);
			if(filters)
				_.each(filters.split(","), function(f){
					if(_.has(dust.filters, f))
						result = dust.filters[f](result);
				});
			return chunk.write(result);
		};
		dust.helpers["set"] = function(chunk, context, bodies, params){
			for(key in params)
				if(_.has(params, key)){
					var value = params[key];
					context.current()[key] = value;
				}
			return chunk.write("");
		};
		for(var name in options.templates.tags){
			var tag = options.templates.tags[name];
			if(!_.has(dust.helpers, name))
				dust.helpers[name] = tag;
		}
		//filters
		dust.filters["trans"] = function(input){
			return self.translator.translate(input);
		};
		dust.filters["title"] = function(input){
		    return input.title();
		};
		dust.filters["capital"] = function(input){
		    return input.capital();
		};
		dust.filters["upper"] = function(input){
		    return input.toUpperCase();
		};
		dust.filters["lower"] = function(input){
		    return input.toLowerCase();
		};
		for(var name in options.templates.filters){
			var filter = options.templates.filters[name];
			if(!_.has(dust.filters, name))
				dust.filters[name] = filter;
		}
		$(options.templates.selector).each(function(index, item){
			var el = $(item);
			var name = el.attr(options.templates.name_attr);
			var source = el.html();
			self.add_template(name, source);
		});
		self.translator = new views.Translator(options.translations);
		self.eventer.emit("viewer.after_init", self);
	},
	add_template: function(name, source){
		var compiled = dust.compile(source, name);
		dust.loadSource(compiled);
	},
	bind: function(variable, attr){
		var self = this;
		var parts = variable.split(".");
		var first_part = _.initial(parts);
		var last_part = _.last(parts);
		first_part = _.reduce(first_part, function(memo, part){ return memo + "." + part});
		if(!self.bindings[variable])
			self.bindings[variable] = [];
		var result;
		if(attr){
			var placeholder = "data-{0}".f(Object.unique4());
			var attribute = attr;
			result = " {0} {1}=''".f(placeholder, attribute);
			var updater = function(newval){
				console.log("attr update", placeholder, newval);
				$("[{0}]".f(placeholder)).each(function(){
					$(this).attr(attribute, newval);
				});
			};
			self.bindings[variable].push(updater);
		}
		else{
			var morph = Metamorph(window[variable]);
			result = morph.outerHTML();
			var updater = function(newval){ 
				morph.html(newval); 
			};
			self.bindings[variable].push(updater);
		}
		//watch changes in global object(we assume that this binding of global object)
		window[first_part].watch(last_part, function(id, oldval, newval){
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
		self.context = context;
		if(!self.context)
			self.context = {};
	},
	render: function(to) {
		if(!to)
			to = "body";
		this.toString(function(out){
			$(to).html(out);
		});
	},
	prepend: function(to){
		if(!to)
			to = "body";
		this.toString(function(out){
			$(to).prepend(out);
		});
	},
	append: function(to){
		if(!to)
			to = "body";
		this.toString(function(out){
			$(to).append(out);
		});
	},
	after: function(target){
		this.toString(function(out){
			$(target).after(out);
		});
	},
	before: function(target){
		this.toString(function(out){
			$(target).before(out);
		});
	},
	toString: function(callback){
		var self = this;
		dust.render(self.name, self.context, function(err, out) {
			if(err)
				console.log("template error", err);
			else
				callback(out);
		});
	}
});

exports.Viewer = Viewer;
exports.View = View;
