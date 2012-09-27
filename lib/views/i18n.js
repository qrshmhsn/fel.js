var SingletonObject = require("../core/types").SingletonObject;

var Translator = SingletonObject.extend({
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
				msg = Translator.format.apply(msg, args);
			}
		}
		return msg || "";	
	}
});

exports.Translator = Translator;
