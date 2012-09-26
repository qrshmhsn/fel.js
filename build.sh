#!/bin/sh
#you need node.js, browserify and uglify.js to start it
#you can run it also as "npm run-script build"
browserify index.js | uglifyjs -o dist/fel.js