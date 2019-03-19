var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/ddd-gc.mp3';

//Pumper.start(TRACK, false);
Pumper.start('mic');
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});
