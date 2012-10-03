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
	        		get: function(id, callback){
	        			model.db.get(id, function(obj){
							callback(model.bd_response_to_model(obj));
	        			});
	        		},
	        		find: function(query, callback){
	        			model.db.all(function(objs){
	        				objs = _.map(objs, function(obj){ return model.bd_response_to_model(obj); });
	        				var result = [];
	        				if(_.isFunction(query))
	        					result = _.filter(objs, query);
	        				else if(_.isObject(query))
	        					result = _.where(objs, query);
	        				callback(result);
	        			});
	        		},
	        		find_one: function(query, callback){
	        			model.db.all(function(objs){
	        				objs = _.map(objs, function(obj){ return model.bd_response_to_model(obj); });
	        				var result = null;
	        				if(_.isFunction(query))
	        					result = _.find(objs, query);
	        				else if(_.isObject(query)){
	        					result = _.where(objs, query);
	        					if(result.length > 0)
	        						result = result[0];
	        					else
	        						result = null;
	        				}
	        				callback(result);
	        			});
	        		},
	        		exists: function(id, callback){
	        			model.db.exists(id, callback);
	        		},
	        		remove_all: function(callback){
	        			model.db.nuke(callback);
	        		},
	        		bd_response_to_model: function(obj){
	        			if(!obj)
	        				return null;
	        			var result = new model();
	        			for(prop_name in model.fields){
							if(prop_name in obj.value)
								result[prop_name] = obj.value[prop_name];
						}
						result.id = obj.key;
						return result;
	        		}
	        	},
	        	__init__: function(props){
					var self = this;
					for(pn in props)
						self[pn] = props[pn];
					if(!("id" in self))
						self.id = Object.guid();
					else if(!_.isString(self.id))
						self.id = self.id.toString();
				},
				save: function(callback){
					var self = this;
					var value = {};
					for(prop_name in self){
						if(prop_name in model.fields)
							value[prop_name] = self[prop_name];
					}
					model.db.save({key: self.id, value: value}, function(obj){
						callback(model.bd_response_to_model(obj));
					});
				},
				remove: function(callback){
					model.db.remove(this.id, callback);
				}
			});
			return model;
		}
	}
});

exports.ModelsManager = ModelsManager;
exports.Model = Model;