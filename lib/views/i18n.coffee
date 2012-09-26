class Translator
	@instance: undefined	
	constructor: (options) ->
		if Translator.instance isnt undefined
			return Translator.instance
		@lang = options.lang;
		@translations = options.translations;
		Translator.instance = this	
	#file format:
	#"<words> {0} <words>" : "<trans_words> {0} <trans_words>"
	translate: (str) ->
		msg = ""
		lang = @translations[@lang];
		if(lang)
			msg = lang[str]
			console.log(@translations, @lang, lang, str, msg);
			if msg and arguments.length > 1
				args = Array.prototype.slice.call arguments, 1
				msg = @substitute msg, args
		return msg || ""	
	substitute: (str, arr) ->
		for i in [0..arr.length]
			pattern = "\\{" + i + "\\}"
			re = new RegExp(pattern, "g")
			str = str.replace re, arr[i] 
		return str || ""

exports.Translator = Translator
