test:
	./node_modules/.bin/mocha

bower:
	./node_modules/.bin/bower install

.PHONY: test bower
