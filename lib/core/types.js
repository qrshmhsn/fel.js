var Class = require("./oop").Class;
var _ = require("underscore");
var Xml2Json = require('./xml2json').Xml2Json;

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
		format: function (str, col) {
		    col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);
		    return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
		        if (m == "{{") { return "{"; }
		        if (m == "}}") { return "}"; }
		        var res = col[n];
		        if(!_.isNull(res) && !_.isUndefined(res))
		        	return res;
		       	else
		       		return "{"+n+"}";
		    });
		},
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
			if(_.isString(input))
				return Xml2Json.xml_str2json(input);
			else
				return Xml2Json.xml_str2json(Object.xml2string(input));
		},
		json2xml: function(input){
			return Xml2Json.json2xml_str(input);
		},
		xml2string: function(xmlNode) {
		    if (typeof window.XMLSerializer != "undefined") {
		        return (new window.XMLSerializer()).serializeToString(xmlNode);
		    } else if (typeof xmlNode.xml != "undefined") {
		        return xmlNode.xml;
		    }
		    return "";
		},
		string2xml: function(text){
			if (window.ActiveXObject){
              var doc=new ActiveXObject('Microsoft.XMLDOM');
              doc.async='false';
              doc.loadXML(text);
            } else {
              var parser=new DOMParser();
              var doc=parser.parseFromString(text,'text/xml');
            }
            return doc;
		},
		guid: function(){
		   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},
		unique4: S4,
		sleep: function(milliSeconds) {
			var startTime = new Date().getTime();
		    while (new Date().getTime() < startTime + milliSeconds);
		},
		startsWith: String.prototype.startsWith,
		hashCode: String.prototype.hashCode,
		is_useragent: function(useragent){
			var ua = navigator.userAgent.toLowerCase();
		    return new RegExp(useragent).test(ua);
		},
		prop: function(from, name){
			var parts = name.split(".");
			var value = _.reduce(parts, function(memo, part){ return memo[part]; }, from);
			return value;
		}
    }
});

var SingletonObject = Object.extend({
	__classvars__ : {
        is_singleton: true,
        classname: "SingletonObject"
    }
});

String.format = String.f = String.prototype.format = String.prototype.f = function() {
    var args = [this]; //out string
	args = args.concat(Array.prototype.slice.call(arguments, 0));
	return Object.format.apply(Object, args);
};

String.prototype.startsWith = function(str) {
    return this.slice(0, str.length) == str;
};

String.prototype.capital = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

String.prototype.title = function() {
    return this.substring(0,1).toUpperCase() + this.substring(1, this.length);;
};

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		var chr = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+chr;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash).toString();
}

if(!String.prototype.trim)
	String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
if(!String.prototype.ltrim)
	String.prototype.ltrim=function(){return this.replace(/^\s+/,'');};
if(!String.prototype.rtrim)
	String.prototype.rtrim=function(){return this.replace(/\s+$/,'');};

function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

exports.Object = Object;
exports.SingletonObject = SingletonObject;