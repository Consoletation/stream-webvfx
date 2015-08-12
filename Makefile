.PHONY : venv be-deps be-build fe-deps fe-build deps build clean run

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

clean:
	rm -f *.bundle.js
	rm -f npm-debug.log
	rm -f supervisord.log
	rm -rf assets/instagram_photos/
	rm -rf instagram_photos/
	rm -rf node_modules
	rm -rf venv

run:
	venv/bin/supervisord -c supervisord.conf -n
