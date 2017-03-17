
install:
	npm install

lint:
	jshint src/

test-node:
	mocha

test-browser:
	karma start

test-build:
	browserify test/quizas.spec.js > test/quizas.built.js

test: lint test-node test-build test-browser
