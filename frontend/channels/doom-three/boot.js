var Pumper = require('pumper'),
    BeatProcessing = require('./index');

var TRACK = '../../audio/temp.flac';

//Pumper.start(TRACK, true);
Pumper.start('mic', 0.12, 0.23);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    custom: {
        families: ['Turnpike'],
        urls: ['https://consoletation.live/fonts/turnpike/stylesheet.css']
    },
    active: BeatProcessing.init
});
