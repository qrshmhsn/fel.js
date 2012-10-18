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
		for(var model_name in options){
			var fields = options[model_name];
			var model = Model.define(model_name, fields);
			self[model_name] = model;
		}
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
	        		all: function(callback){
	        			model.db.all(function(objs){
	        				objs = _.map(objs, function(obj){ return model.bd_response_to_model(obj); });
	        				callback(objs);
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
	        		save_all: function(arr, callback){
						if(!callback)
		        			callback = function(){};
		        		var saving_arr = [];
		        		_.each(arr, function(item){
		        			saving_arr.push(model.model_to_bd_request(new model(item)));
		        		});
						model.db.batch(saving_arr, function(objs){
							var ret_arr = _.map(objs, function(obj){ return model.bd_response_to_model(obj); });
							callback(ret_arr);
						});
					},
					remove: function(id, callback){
						if(!callback)
		        			callback = function(){};
						model.db.remove(id, callback);
					},
	        		remove_all: function(callback){
	        			if(!callback)
	        				callback = function(){};
	        			model.db.nuke(callback);
	        		},
	        		inherit: function(inh_name, fields){
	        			fields = Object.merge(fields, model.fields);
	        			var inh_model = Model.define(name, fields);
	        			return inh_model;
	        		},
	        		bd_response_to_model: function(obj){
	        			if(!obj)
	        				return null;
	        			var result = new model();
	        			for(prop_name in model.fields){
							if(prop_name in obj.value){
								var prop_value = obj.value[prop_name];
								//creating date, another types(string, number, boolean) supported by lawnchair
								if(model.fields[prop_name] == "date"){
									var d = new Date();
									d.setTime(Date.parse(prop_value));
									prop_value = d;
								}
								else if(_.isObject(model.fields[prop_name]) && 
										model.fields[prop_name].model){
									var m = model.fields[prop_name].model;
									var k = model.fields[prop_name].key;
									var prop = prop_name;
									var val = prop_value;
									if(!k || k == "id")
										m.get(val, function(o){
											result[prop] = o;
											//console.log("relation!", m.fields, val, prop, o);
										});
									else
										m.find_one(
											function(ob){ return ob[k] == val; },
											function(o){
												result[prop] = o;
												//console.log("relation!", m.fields, val, prop, o);
											}
										);
								}
								result[prop_name] = prop_value;
							}
						}
						result.id = obj.key;
						return result;
	        		},
	        		model_to_bd_request: function(mdl){
	        			var value = {};
						for(prop_name in mdl){
							if(prop_name in model.fields)
								value[prop_name] = mdl[prop_name];
						}
						return {key: mdl.id, value: value};
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
					if(!callback)
	        			callback = function(){};
					model.db.save(model.model_to_bd_request(self), function(obj){
						callback(model.bd_response_to_model(obj));
					});
				},
				remove: function(callback){
					model.remove(this.id, callback);
				}
			});
			return model;
		}
	}
});

exports.ModelsManager = ModelsManager;
exports.Model = Model;