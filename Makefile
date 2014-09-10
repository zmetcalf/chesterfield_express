test:
	./node_modules/.bin/mocha

thumbnails:
	rm -rf media/thumbnails/
	node ./node_modules/quickthumb/bin/make-thumb.js media/ media/thumbnails/ 269x204 -p -r

.PHONY: test thumbnails
