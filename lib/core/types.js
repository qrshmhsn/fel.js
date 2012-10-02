var Class = require("./oop").Class;
var _ = require("underscore");
var Xml2Json = require('./xml2json').Xml2Json;

String.format = String.f = String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

String.prototype.startsWith = function(str) {
    return this.slice(0, str.length) == str;
};

function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

var Object = Class.extend({
	__classvars__ : {
		classname: "Object",
		merge: function(obj1, obj2){
			//obj1 <-- obj2
			for(key in obj1){
				var value = obj1[key];
				if(obj2 && obj2[key]){
					var value2 = obj2[key];
					if(value instanceof Array){
						if(value2 instanceof Array)
							value.concat(value2);
						else
							value.push(value2)
					}
					else if(_.isString(value) || _.isNumber(value) || _.isBoolean(value) || _.isDate(value) || _.isEmpty(value)) {
						obj1[key] = value2;
					}
					else {
						Object.merge(value, value2);
					}
				}
			}
			//searching keys in obj2 which obj1 doesn't have
			var new_keys = _.difference(_.keys(obj2), _.keys(obj1));
			_.each(new_keys, function(key){
				obj1[key] = obj2[key];
			});
			return obj1;
		},
		format: String.prototype.format,
		namespace: function(namespaceString) {
		    var parts = namespaceString.split('.'),
		        parent = window,
		        currentPart = '';        
		    for(var i = 0, length = parts.length; i < length; i++) {
		        currentPart = parts[i];
		        parent[currentPart] = parent[currentPart] || {};
		        parent = parent[currentPart];
		    }  
		    return parent;
		},
		xml2json: function(input){
			return Xml2Json.xml_str2json(input);
		},
		json2xml: function(input){
			return Xml2Json.json2xml_str(input);
		},
		guid: function(){
		   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},
		unique4: S4
    }
});

var SingletonObject = Object.extend({
	__classvars__ : {
        is_singleton: true,
        classname: "SingletonObject"
    }
});
/*
options = {
	views: {
		templates: {},
		translations: {},
		lang: "ru"
	}
};
options2 = {
	views: {
		templates: {one: "lakdfj"},
		translations: {ru: "lala"}
	}
};
options = Object.merge(options, options2)
console.log(options);*/
exports.Object = Object;
exports.SingletonObject = SingletonObject;