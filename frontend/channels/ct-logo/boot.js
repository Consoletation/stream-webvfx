var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/ddd-gc.mp3';

//Pumper.start(TRACK, 1440, 14000);
Pumper.start('mic', 1440, 14000);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});
