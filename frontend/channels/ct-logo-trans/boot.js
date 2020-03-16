var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/temp.flac';

//Pumper.start(TRACK, true);
Pumper.start('mic');
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});