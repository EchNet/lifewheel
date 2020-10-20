apps: build/app1.js

run:
	./node_modules/.bin/nodemon ./devserver.js 

build/app1.js: apps/app1.js core/lifewheel.js
	./node_modules/.bin/browserify --debug apps/app1.js -o build/app1.js

parcel:
	./node_modules/.bin/parcel build client/launch.js

clean:
	rm -rf dist .cache build
