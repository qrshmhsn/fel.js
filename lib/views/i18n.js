var Singleton = require("../core/oop").Singleton;

var Translator = Singleton.extend({
	__init__: function(options){
		this.lang = options.lang;
		this.translations = options.translations;
	},
	//file format:
	//"<words> {0} <words>" : "<trans_words> {0} <trans_words>"
	translate: function(str){
		var self = this;
		var msg = ""
		var lang = self.translations[self.lang];
		if(lang){
			msg = lang[str];
			if(msg && arguments.length > 1){
				var args = Array.prototype.slice.call(arguments, 1);
				msg = self.substitute(msg, args);
			}
		}
		return msg || "";	
	},
	substitute: function(str, arr){
		console.log(arr);
		for(i=0; i < arr.length; ++i){
			var pattern = "\\{" + i + "\\}";
			var re = new RegExp(pattern, "g");
			str = str.replace(re, arr[i]);
		}
		return str || "";
	}
});

exports.Translator = Translator;
