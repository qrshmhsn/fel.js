var SingletonObject = require("../core/types").SingletonObject;
var _ = require("underscore");

var Translator = SingletonObject.extend({
	__classvars__ : {
        classname: "Translator"
    },
	__init__: function(options){
		this.lang = options.lang;
		this.source = options.source;
	},
	//file format:
	//"<words> {0} <words>" : "<trans_words> {0} <trans_words>"
	translate: function(str){
		var self = this;
		var msg = "";
		var lang = self.source[self.lang];
		if(lang){
			msg = lang[str];
			if(msg && arguments.length > 1){
				var args = _.rest(arguments)
				msg = Translator.format.apply(msg, args);
			}
		}
		return msg || str;
	}
});

exports.Translator = Translator;
