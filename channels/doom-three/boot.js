import { Pumper } from 'pumper';
import BeatProcessing from './index.js';

var TRACK = '../../audio/temp.flac';

const pumper = new Pumper();
pumper.start('mic', 5760, 11040);
pumper.globalSpikeTolerance = 14;
window.pumper = pumper;

WebFont.load({
    custom: {
        families: ['Turnpike'],
        urls: ['https://consoletation.live/fonts/turnpike/stylesheet.css'],
    },
    active: BeatProcessing.init,
});
