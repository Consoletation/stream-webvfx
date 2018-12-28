var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/home.mp3';

Pumper.start(TRACK, true);
//Pumper.start('mic');
Pumper.globalSpikeTolerance = 14;



var f = new FontFace('Apercu', 'url(../../assets/fonts/apercu-regular.ttf)', {});
f.load().then(function (loadedFace) {
    document.fonts.add(loadedFace);
    BeatProcessing.init();
});
