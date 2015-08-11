.PHONY : venv fe-deps run

venv: venv/bin/activate
venv/bin/activate: requirements.txt
	test -d venv || virtualenv venv
	venv/bin/pip install -Ur requirements.txt
	touch venv/bin/activate

fe-deps: package.json
	npm install

run: venv fe-deps
	venv/bin/supervisord -c supervisord.conf -n
