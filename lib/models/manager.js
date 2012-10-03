var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;
var _ = require("underscore");
var Lawnchair = require("./lawnchair").Lawnchair;

var ModelsManager = SingletonObject.extend({
	__classvars__ : {
        classname: "ModelsManager"
    },
	__init__: function(app, options){
		var self = this;
		/*var users = new Lawnchair({name:'db1'}, function(e) {
		    console.log("users storage opened");
		});
		//users.nuke();
	    users.save({key: "stas", age:23, occupations:"programmer"});
	    users.get('stas', function(me) {
	        console.log(me);
	    });
		console.log("manager started");*/
	}
});

var Model = Object.extend({
	__classvars__ : {
		define: function(name, fields){
			var model = Object.extend({
				__classvars__ : {
	        		name: name,
	        		fields: fields,
	        		db: new Lawnchair({name: name}, function(){}),
	        		get: function(key, callback){
	        			var result = new model();
	        			model.db.get(key, function(obj){
	        				for(prop_name in model.fields){
								if(prop_name in obj.value)
									result[prop_name] = obj.value[prop_name];
							}
							result.id = obj.key;
							callback(result);
	        			});
	        		}
	        	},
	        	__init__: function(props){
					var self = this;
					for(pn in props)
						self[pn] = props[pn];
				},
				save: function(callback){
					var self = this;
					var value = {};
					for(prop_name in self){
						if(prop_name in model.fields)
							value[prop_name] = self[prop_name];
					}
					model.db.save({key: self.id, value: value}, function(obj){
						callback(self);
					});
				}
			});
			model.db.nuke();
			return model;
		}
	}
});

exports.ModelsManager = ModelsManager;
exports.Model = Model;