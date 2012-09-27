var Class = require("./oop").Class;

String.format = String.f = String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

var Object = Class.extend({
	__classvars__ : {
    	is_empty: function(obj){
			for(key in obj)
				return false;
			return true;
		},
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
					else if(typeof value == "string" || typeof value == "number" || typeof value == "boolean" || Object.is_empty(value)) {
						obj1[key] = value2;
					}
					else {
						Object.merge(value, value2);
					}
				}
			}
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
		}
    }
});

var SingletonObject = Object.extend({
	__classvars__ : {
        is_singleton: true
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