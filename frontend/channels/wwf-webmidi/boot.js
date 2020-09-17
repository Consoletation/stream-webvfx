var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/pacemaker.mp3';

//Pumper.start(TRACK, true);
Pumper.start('mic', 0.12, 0.21);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});
