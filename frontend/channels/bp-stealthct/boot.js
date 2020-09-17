var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/pacemaker.mp3';

//Pumper.start(TRACK, true);
Pumper.start('mic', 0.03, 0.29);
Pumper.globalSpikeTolerance = 14;



var f = new FontFace('Patua One', 'url(../../assets/fonts/PatuaOne-Regular.ttf)', {});
f.load().then(function (loadedFace) {
    document.fonts.add(loadedFace);
    BeatProcessing.init();
});
