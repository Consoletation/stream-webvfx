import { Pumper } from 'pumper';
import BeatProcessing from './index.js';

var TRACK = '../../audio/pacemaker.mp3';

const pumper = new Pumper();
pumper.start('mic', 5760, 10080);
pumper.globalSpikeTolerance = 14;
window.pumper = pumper;

WebFont.load({
    typekit: { id: 'oiz4knz' },
    active: BeatProcessing.init,
});
