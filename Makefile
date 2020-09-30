current_dir = $(shell pwd)

go:
	./node_modules/.bin/nodemon ./devserver.js 

watch:
	./node_modules/.bin/parcel watch client/launch.js

parcel:
	./node_modules/.bin/parcel build client/launch.js

clean:
	rm -rf dist .cache build
