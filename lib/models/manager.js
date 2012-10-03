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
	        		db: new Lawnchair({name: name}, function(){}),
	        		get: function(key, callback){
	        			model.db.get(key, callback);
	        		}
	        	},
	        	__init__: function(key, value){
					var self = this;
					self.key = key;
					self.value = value;
				},
				save: function(callback){
					var self = this;
					model.db.save({key: self.key, value: self.value}, callback);
				}
			});
			model.db.nuke();
			return model;
		}
	}
});

exports.ModelsManager = ModelsManager;
exports.Model = Model;