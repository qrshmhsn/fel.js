if(typeof window != "undefined")
	exports = window;
var fel = {}
fel.core = require('./lib/core');
fel.views = require('./lib/views');
fel.controllers = require("./lib/controllers");
exports.fel = fel;
