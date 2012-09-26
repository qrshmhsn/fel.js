eventemitter2 = require "eventemitter2"
views = require "../views"
utils = require "./utils"

class Application
	@instance: undefined
	constructor: (options) ->
		if Application.instance isnt undefined
			return Application.instance
		Application.instance = this
		console.log "app starting..."
		@options =
			views:
				templates: {},
				translations: {},
				lang: "ru",
				filters:
					trans: (input) ->
						return views.Translator().translate(input)
		@options = utils.Object.merge(@options, options)
		console.log("got options", @options)
		@eventer = new eventemitter2.EventEmitter2({wildcard: true})
		@viewer = new views.Viewer(@options.views)
		console.log(@viewer.templates.main_page());
		#@eventer.emit "application.started", this
		console.log "app started"

exports.Application = Application
