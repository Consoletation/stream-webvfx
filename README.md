# 10th-birthday-visuals

Because rehab is/was 10 years old and we wanted to do some demoscene-type
visual stuff for it.  In the browser.  Because we could.

### Installation

You need Python 2.7, Node.js, and npm installed in your environment.

Just clone the repo and run the Makefile to get started. Here are some
examples:

  * `make run` - Runs webpack-dev-server and all python support scripts
  * `make clean` - Cleans all temporary files from your directory

`make run` will also ensure frontend and backend components are installed and
built. If you want to run these manually, just do `make build` or `make deps`.

Local server is on `localhost:8080`.

Dockerfile is present for deployment to rehab-labs. _[TODO: documentation]_

### Deploying

Deployment is done via a push-to-deploy service on rehab-labs. To use this
you must add another git remote using the following command:

`git remote add labs ssh://git@build.rehab-labs.com/git/RS/10th-birthday-visuals.git`

To deploy the master branch then you simply run:

`git push -f labs master`

If you wish to deploy a branch other than master, use the following:

`git push -f <branch-you-are-deploying>:master`

For example, to deploy develop:

`git push -f develop:master`

The deployed code will be built upon push and made available at

`https://party-viz.rehab-labs.com`

### Notes / About

Visuals are built using HTML5 Canvas, WebGL, Web Audio API and Unity.

The concept is that of different 'channels', like a TV, that can be manually
or randomly selected.  Each channel has a different visual or treatment.
Some of them accept live audio input to generate reactive visuals.

Check the README and comments in each channel for more details.

#### Channels

'Channels' are subdirectories of `/channels` which must contain an `index.html` and a `boot.js`.
Webpack uses the `boot.js` as a bundle entrypoint and outputs `<channelname>.bundle.js` inside the channel
directory.  The `index.html` must load this bundle.

`index.html` and `main.js` comprise a 'channel changer' system.  They will load the 
`index.html` of whatever channel is selected.  Channels must be added to the `CHANNELS` object 
in `index.js` to be picked up by the system.

Numeric keyboard shortcuts will change active channels, with 0 chaning to a screen of static.

### Todos

 - Documentation & comments
 - Global sensitivity/compression tweak for reactive stuff
 - Pubish the `Pumper` module (maybe think of a better name for it...)
 - Web MIDI support for manual channel-changing

License
----

MIT
