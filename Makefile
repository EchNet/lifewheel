apps: build/app1.js build/app2pdf.js

build/app1.js: apps/app1.js core/*.js
	./node_modules/.bin/browserify --debug apps/app1.js -o build/app1.js

build/app2pdf.js: apps/app2pdf.js core/*.js
	./node_modules/.bin/browserify --debug apps/app2pdf.js -o build/app2pdf.js

watch2: build/app2pdf.js
	./node_modules/.bin/watchify --debug apps/app2pdf.js -o build/app2pdf.js

run:
	node ./devserver.js 
