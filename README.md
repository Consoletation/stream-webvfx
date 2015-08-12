# 10th-birthday-visuals

Because rehab is/was 10 years old and we wanted to do some demoscene-type visual stuff for it.  In the browser.  Because we could.

### Installation

You need Python 2.7, Node.js, and npm installed in your environment.

Just clone the repo and run the Makefile to get started. Here are some examples:

  * `make run` - Runs webpack-dev-server and all python support scripts
  * `make clean` - Cleans all temporary files from your directory

`make run` will also ensure virtualenv and npm modules are up to date. If you want to run these manually, just do `make venv` or `make fe-deps`.
Local server is on `localhost:8080`.

Dockerfile is present for deployment to rehab-labs. _[TODO: documentation]_

### Notes / About

Visuals are built using HTML5 Canvas, WebGL, Web Audio API and Unity.

The concept is that of different 'channels', like a TV, that can be manually or randomly selected.  Each channel has a different visual or treatment.  Some of them accept live audio input to generate reactive visuals.

Check the README and comments in each channel for more details.

### Todos

 - Documentation & comments
 - Global sensitivity/compression tweak for reactive stuff
 - Pubish the `Pumper` module (maybe think of a better name for it...)
 - Web MIDI support for manual channel-changing

License
----

MIT
