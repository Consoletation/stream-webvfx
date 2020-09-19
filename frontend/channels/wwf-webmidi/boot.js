import Pumper from 'pumper';
import BeatProcessing from './index.js';

var TRACK = '../../audio/pacemaker.mp3';

//Pumper.start(TRACK, 1440, 14000);
Pumper.start('mic', 5760, 10080);
Pumper.globalSpikeTolerance = 14;

WebFont.load({
    typekit: {id: 'oiz4knz'},
    active: BeatProcessing.init
});
