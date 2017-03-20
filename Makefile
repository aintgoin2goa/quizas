
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


deploy:
ifndef CIRCLE_TAG
	$(error CIRCLE_TAG is not defined)
endif
ifndef NPM_USERNAME
	$(error NPM_USERNAME is not defined)
endif
ifndef NPM_PASSWORD
	$(error NPM_PASSWORD is not defined)
endif
ifndef NPM_EMAIL
	$(error NPM_EMAIL is not defined)
endif
	git config --global user.email ${NPM_EMAIL}
	git config --global user.name ${NPM_USERNAME}
	echo "${NPM_USERNAME}\n${NPM_PASSWORD}\n${NPM_EMAIL}" | npm login
	npm version $(subst v,,${CIRCLE_TAG})
	npm publish
