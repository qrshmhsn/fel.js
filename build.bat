@echo off
rem you need node.js, browserify and uglify.js to start it
rem you can run it also as "npm run-script build"
browserify index.js -o dist/fel.js
rem uglifyjs dist/fel.js