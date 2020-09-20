import Pumper from 'pumper';
import BeatProcessing from './index.js';

var TRACK = '../../audio/temp.flac';

//Pumper.start(TRACK, 1440, 14000);
Pumper.start('mic', 5760, 11040);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    custom: {
        families: ['Turnpike'],
        urls: ['https://consoletation.live/fonts/turnpike/stylesheet.css']
    },
    active: BeatProcessing.init
});
