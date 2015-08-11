# 10th-birthday-visuals

Because rehab is/was 10 years old and we wanted to do some demoscene-type visual stuff for it.  In the browser.  Because we could.

### Installation

You need Webpack installed globally.

Just clone the repo and run `npm install` to set up, followed by `webpack-dev-server --progress --colors` to build & watch.  Local server is on `localhost:8080`.

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