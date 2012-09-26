swig = require 'swig'
views = require '../views'
core = require "../core"

class Viewer
	@instance: undefined	
	constructor: (@app, @options)->
		if Viewer.instance isnt undefined
			return Viewer.instance
		Viewer.instance = this
		@app.eventer.emit "viewer.before_start", this
		swig.init({filters: @options.filters})
		@templates = {}
		for name, content of @options.templates
			@add_template(name, content)
		#translations
		new views.Translator(
	    	lang: @options.lang
	    	translations: @options.translations
	    )
		@app.eventer.emit "viewer.after_start", this
	add_template: (name, content) ->
		@templates[name] = swig.compile(content, {filename: name})

exports.Viewer = Viewer
