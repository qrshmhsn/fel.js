swig = require 'swig'
i18n = require './i18n'

class Viewer
	@instance: undefined	
	constructor: (@options)->
		if Viewer.instance isnt undefined
			return Viewer.instance
		console.log("viewer initializing...");
		swig.init({filters: @options.filters})
		@templates = {}
		for name, content of @options.templates
			@add_template(name, content)
		#translations
		new i18n.Translator(
	    	lang: @options.lang
	    	translations: @options.translations
	    )
	    console.log("tr", i18n.Translator().translate("hello, {0}", "Stas"))
		console.log("viewer initialized.")
		Viewer.instance = this
	add_template: (name, content) ->
		@templates[name] = swig.compile(content, {filename: name})

exports.Viewer = Viewer
