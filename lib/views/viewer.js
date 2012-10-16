var dust = require("dust.js");
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
		//binding tag
		//usage: {@binding value="app.var1"/}
		dust.helpers["binding"] = function(chunk, context, bodies, params){
			var variable = params.value;
			var parts = variable.split(".");
			var first_part = _.initial(parts);
			var last_part = _.last(parts);
			first_part = _.reduce(first_part, function(memo, part){ return memo + "." + part});
			var morph = Metamorph(window[variable]);
			if(!self.bindings[variable])
				self.bindings[variable] = [];
			self.bindings[variable].push(morph);
			//watch changes in global object(we assume that this binding of global object)
			window[first_part].watch(last_part, function(id, oldval, newval){
				_.each(self.bindings[variable], function(m){
					m.html(newval); //update each morph
				});
			});
			return chunk.write(morph.outerHTML());
		};
		//trans tag
		//usage: {@trans value="main"/}
		dust.helpers["trans"] = function(chunk, context, bodies, params){
			var input = params.value;
			return chunk.write(self.translator.translate(input));
		};
		for(var name in options.templates.tags){
			var tag = options.templates.tags[name];
			if(!_.has(dust.helpers, name))
				dust.helpers[name] = tag;
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
	toString: function(callback){
		var self = this;
		dust.render(self.name, self.context, function(err, out) {
			if(out)
				callback(out);
		});
	}
});

exports.Viewer = Viewer;
exports.View = View;
