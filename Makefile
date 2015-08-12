.PHONY : venv fe-deps clean run

venv: venv/bin/activate
venv/bin/activate: requirements.txt
	test -d venv || virtualenv venv
	venv/bin/pip install -Ur requirements.txt
	touch venv/bin/activate

fe-deps: package.json
	npm install

clean:
	rm -f npm-debug.log
	rm -f supervisord.log
	rm -rf assets/instagram_photos/
	rm -rf instagram_photos/
	rm -rf node_modules
	rm -rf venv

run: venv fe-deps
	venv/bin/supervisord -c supervisord.conf -n
