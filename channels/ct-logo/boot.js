import Pumper from 'pumper';
import BeatProcessing from './index.js';

var TRACK = '../../audio/ddd-gc.mp3';

//Pumper.start(TRACK, 1160, 14000, 12);
Pumper.start('mic', 1160, 14000, 12);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});
