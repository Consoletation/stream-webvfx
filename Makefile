.PHONY : venv be-deps be-build fe-deps fe-build deps build docker-build clean docker-run run

venv: venv/bin/activate
venv/bin/activate: requirements.txt
	test -d venv || virtualenv venv
	venv/bin/pip install -Ur requirements.txt
	touch venv/bin/activate

be-deps: venv

be-build: be-deps

fe-deps: package.json
	npm install

fe-build: fe-deps
	node node_modules/webpack/bin/webpack.js

deps: be-deps fe-deps

build: be-build fe-build

docker-build:
	docker build -t party-viz .

clean:
	rm -f *.bundle.js
	rm -f *.bundle.js.map
	rm -f npm-debug.log
	rm -f supervisord.log
	rm -rf assets/instagram_photos/
	rm -rf instagram_photos/
	rm -rf node_modules
	rm -rf venv

docker-run:
	docker run -p 8080:8080 -p 8443:8443 party-viz

run:
	venv/bin/supervisord -c supervisord.conf -n
