var SingletonObject = require("../core/types").SingletonObject;
var Object = require("../core/types").Object;
var _ = require("underscore");
var db = require("./storage").Db;

var ModelsManager = SingletonObject.extend({
	__classvars__ : {
        classname: "ModelsManager"
    },
	__init__: function(app, options){
		var self = this;
		if(options.database)
			Model.database = options.database;
		// for(var model_name in options){
		// 	var fields = options[model_name];
		// 	var model = Model.define(model_name, fields);
		// 	self[model_name] = model;
		// }
	}
});

var Model = Object.extend({
	__classvars__ : {
		registry: {},
		database: "",
		define: function(table_name, fields){
			var model = Object.extend({
				__classvars__ : {
	        		fields: fields,
	        		children: [],
	        		inherit: function(inh_name, fields0){
	        			var new_fields = Object.merge(fields0, model.fields);
	        			var inh_model = Model.define(inh_name, new_fields);
	        			model.children.push(inh_model);
	        			return inh_model;
	        		},
	        		get: function(id, no_follow){
	        			var from_db = db.get(model.to_row_id(id));
	        			if(!from_db){
	        				_.all(model.children, function(child){
		        				var r = child.get(id);
		        				if(r){
		        					from_db = r;
		        					return false;
		        				}
		        			});
		        			if(!from_db)
		        				return null;
	        			}
	        			from_db.id = id;
	        			return new model(from_db, no_follow);
	        			//return db.get(model.to_row_id(id), no_follow);
	        		},
	        		all: function(no_follow){
	        			var results = [];
	        			_.each(db.keys(), function(key){
	        				if(key.startsWith(Model.database+table_name.hashCode())){
	        					var from_db = db.get(key);
	        					if(from_db){
		        					from_db.id = model.from_row_id(key);
		        					results.push(new model(from_db, no_follow));
		        				}
	        				}
	        			});
	        			_.each(model.children, function(child){
	        				_.each(child.all(), function(r){
	        					console.log("child result", r);
	        					results.push(r);
	        				});
	        			});
	        			return results;
	        		},
	        		find: function(query, no_follow){
	        			var objs = model.all(no_follow);
	        			var result = [];
        				if(_.isFunction(query))
        					result = _.filter(objs, query);
        				else if(_.isObject(query))
        					result = _.where(objs, query);
        				return result;
	        		},
	        		find_one: function(query, no_follow){
	        			var objs = model.all(no_follow);
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
        				return result;
	        		},
	        		exists: function(id){
	        			var objs = model.all();
	        			return _.any(objs, function(obj){
	        				return id == obj.id;
	        			});
	        		},
					remove: function(id){
						db.remove(model.to_row_id(id));
					},
	        		remove_all: function(){
	        			_.each(model.all(), function(o){
	        				//console.log(o);
	        				o.remove();
	        			});
	        		},
	        		to_row_id: function(id){ 
	        			return Model.database+table_name.hashCode()+id;
	        		},
	        		from_row_id: function(row_id){
	        			var system_part = Model.database+table_name.hashCode();
	        			return row_id.substring(system_part.length);
	        		}
	        	},
	        	__init__: function(props, no_follow){
					var self = this;
					if(!props)
						props = {};
					if(props.id && _.isString(props.id))
						self.id = props.id;
					else
						self.id = Object.guid();
					for(var prop_name in model.fields){
        				var prop_type = model.fields[prop_name];
						var prop_value = props[prop_name];
						if(_.isObject(prop_type) && prop_type.model && !no_follow){
							var m = Model.registry[prop_type.model];
							if(!m)
								continue;
							var k = prop_type.key;
							var many = prop_type.many;
							if(many && k)
								prop_value = m.find(function(ob){ return ob[k] == self.id; }, true);
							else{
								var rel_value = m.get(prop_value, true);
								if(rel_value)
									prop_value = rel_value;
							}
						}
						else {
							//creating date, another types(string, number, boolean) supported
							if(prop_type == "date"){
								var d = new Date();
								d.setTime(Date.parse(prop_value));
								prop_value = d;
							}
						}
						if(prop_name != "id")
							self[prop_name] = prop_value;
        			}
				},
				save: function(){
					var self = this;
					var value = {};
					for(prop_name in self){
						if(prop_name in model.fields && prop_name != "id"){
							if(_.isObject(self[prop_name]) && model.fields[prop_name].model)
								value[prop_name] = self[prop_name].id;
							else
								value[prop_name] = self[prop_name];
						}
					}
					//console.log("saving", self.id, value);
					db.set(model.to_row_id(self.id), value);
				},
				remove: function(){
					model.remove(this.id);
				}
			});
			Model.registry[table_name] = model;
			return model;
		},
		clear: function(){
			_.each(db.index(), function(key){
				db.remove(key);
			});
		}
	}
});

exports.ModelsManager = ModelsManager;
exports.Model = Model;