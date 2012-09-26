class Object
	@is_empty: (obj) ->
		for key, value of obj
			return false
		return true
	@merge: (obj1, obj2) ->
		#obj1 <-- obj2
		for key, value of obj1
			if obj2?[key]?
				if value instanceof Array
					value2 = obj2[key]
					if value2 instanceof Array
						value.push(value2...)
					else
						value.push(value2)
				else if typeof value is "string" or typeof value is "number" or typeof value is "boolean" or Object.is_empty(value)
					obj1[key] = obj2[key]
				else
					Object.merge(value, obj2[key])
		return obj1
###
options =
	views:
		templates: {}
		translations: {}
		lang: "ru"
		filters:
			trans: (input) ->
				return views.Translator().translate(input)
options2 =
	views:
		templates: {one: "lakdfj"}
		translations: {ru: "lala"}
options = Object.merge(options, options2)
console.log(options)
###
exports.Object = Object