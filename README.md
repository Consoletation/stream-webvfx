# Stream WebVFX

This repo is a collection of projects used for stream effects on the
[Consoletation] and [StealthCT] Twitch channels.

### Usage

You need Node, and npm installed in your environment.

Just clone the repo and run `npm install` to get started. Here are some
examples:

  * `npm run build` - Builds all frontend channels
  * `npm run start:dev` - Runs webpack-dev-server and monitors changes

Local server is on `localhost:8080`.

### Notes / About

Visuals are built using HTML5 Canvas, WebGL, Web Audio API and WebMidi.

The concept is that of different 'channels', like a TV, that can be manually
or randomly selected.  Each channel has a different visual or treatment.
Some of them accept live audio input to generate reactive visuals.

Check the README and comments in each channel for more details.

#### Channels

'Channels' are subdirectories of `/channels` which must contain an
`index.html` and a `boot.js`. Webpack uses the `boot.js` as a bundle
entrypoint and outputs `<channelname>.bundle.js` inside the channel directory.
The `index.html` must load this bundle.

`index.html` and `main.js` comprise a 'channel changer' system.  They will
load the `index.html` of whatever channel is selected.  Channels must be added
to the `CHANNELS` object in `index.js` to be picked up by the system.

Numeric keyboard shortcuts will change active channels, with 0 chaning to a
screen of static.

### External Libraries

- [pumper] - Web Audio API analysis & monitoring library
- [three.js] - JavaScript 3D library
- [WebMidi] - Tame the Web MIDI API

### Origin

The original staging ground for a lot of these ideas was a collective of
individuals working at [rehab] - a digital marketing agency based originally
in Belfast, now London. When the studio was 10 years old we wanted to do some
demoscene-type visual stuff for the celebration party DJ set. In the browser.
Because we could.

Listed below are the creatives that put together a lot of the ground work
behind some of these concepts:

- [Daniel Porter Wilgar](https://github.com/Stealthii)
- [Ryan Grieve](https://github.com/grieve)
- [Neil McCallion](https://github.com/njmcode)
- [Mickael Coelho](https://github.com/MickCoelho)


[rehab]: https://www.rehabagency.ai/
[Consoletation]: https://twitch.tv/Consoletation
[StealthCT]: https://twitch.tv/StealthCT
[pumper]: https://github.com/Consoletation/pumper
[three.js]: https://threejs.org/
[WebMidi]: https://github.com/djipco/webmidi
