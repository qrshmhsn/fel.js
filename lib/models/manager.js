var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;
var _ = require("underscore");
var Lawnchair = require("./lawnchair").Lawnchair;
var async = require("async");

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
		registry: {},
		define: function(name, fields){
			var model = Object.extend({
				__classvars__ : {
	        		name: name,
	        		fields: fields,
	        		db: new Lawnchair({name: name}, function(){}),
	        		get: function(id, callback, no_follow){
	        			model.db.get(id, function(obj){
	        				model.bd_response_to_model(obj, callback, no_follow);
	        			});
	        		},
	        		all: function(callback, no_follow){
	        			model.db.all(function(objs){
	        				objs = _.filter(objs, function(o){ return o.value.model_name == model.model_name; });
	        				model.bd_results_to_models(objs, callback, no_follow);
	        			});
	        		},
	        		find: function(query, callback, no_follow){
	        			model.all(function(objs){
	        				var result = [];
	        				if(_.isFunction(query))
	        					result = _.filter(objs, query);
	        				else if(_.isObject(query))
	        					result = _.where(objs, query);
	        				callback(result);
	        			}, no_follow);
	        		},
	        		find_one: function(query, callback, no_follow){
	        			model.all(function(objs){
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
	        			}, no_follow);
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
							model.bd_results_to_models(objs, callback);
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
	        			fields.model_name = "string";
	        			var inh_model = Model.define(name, fields);
	        			inh_model.model_name = inh_name;
	        			return inh_model;
	        		},
	        		bd_response_to_model: function(obj, result_callback, no_follow){
	        			if(!obj)
	        				return null;
	        			var result = new model();
	        			var values_types = [];
	        			for(prop_name in model.fields){
	        				var prop_type = model.fields;
	        				values_types.push({prop_name: prop_name, prop_type: prop_type});
	        			}
	        			async.forEach(
	        				values_types, 
	        				function(vt, callback){
		        				var prop_name = vt.prop_name;
		        				var prop_type = vt.prop_type;
								if(prop_name in obj.value || (_.isObject(prop_type[prop_name])) && !no_follow){
									var prop_value = obj.value[prop_name];
									if(_.isObject(prop_type[prop_name]) && 
											prop_type[prop_name].model && !no_follow){
										var m = Model.registry[prop_type[prop_name].model];
										var k = prop_type[prop_name].key;
										var prop = prop_name;
										var val = prop_value;
										var many = prop_type[prop_name].many;
										if(many && k){
											result[prop] = [];
											m.find(
												function(ob){ return ob[k] == obj.key; },
												function(o){
													result[prop].push(o);
													//console.log("relation!", m.fields, val, prop, o);
													callback();
												},
												true
											);
										}
										else{
											if(!k || k == "id")
												m.get(val, function(o){
													result[prop] = o;
													//console.log("relation!", m.fields, val, prop, o);
													callback();
												});
											else
												m.find_one(
													function(ob){ return ob[k] == val; },
													function(o){
														result[prop] = o;
														//console.log("relation!", m.fields, val, prop, o);
														callback();
													},
													true
												);
										}
									}
									else{
										//creating date, another types(string, number, boolean) supported by lawnchair
										if(prop_type[prop_name] == "date"){
											var d = new Date();
											d.setTime(Date.parse(prop_value));
											prop_value = d;
										}
										result[prop_name] = prop_value;
										callback();
									}
								}
								else
									callback();
							},
							function(err){ 
								result.id = obj.key;
								result_callback(result); 
							}
						);
	        		},
	        		bd_results_to_models: function(objs, callback, no_follow){
	        			async.map(
        					objs, 
        					function(obj, callback){ 
        						model.bd_response_to_model(obj, function(r){
        							callback(null, r);
        						}, no_follow); 
        					},
        					function(err, results){
        						callback(results);
        					}
        				);
	        		},
	        		model_to_bd_request: function(mdl){
	        			var value = {};
	        			//console.log("model", model.fields);
						for(prop_name in mdl){
							if(prop_name in model.fields && prop_name != "id"){
								if(_.isObject(mdl[prop_name]) && model.fields[prop_name].model)
									value[prop_name] = mdl[prop_name].id;
								else
									value[prop_name] = mdl[prop_name];
							}
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
					//for inheritance
					if("model_name" in model.fields)
						self.model_name = model.model_name;
				},
				save: function(callback){
					var self = this;
					if(!callback)
	        			callback = function(){};
					model.db.save(model.model_to_bd_request(self), function(obj){
						//console.log("saved in bd", obj);
						callback(self);
					});
				},
				remove: function(callback){
					model.remove(this.id, callback);
				}
			});
			Model.registry[name] = model;
			return model;
		}
	}
});

exports.ModelsManager = ModelsManager;
exports.Model = Model;