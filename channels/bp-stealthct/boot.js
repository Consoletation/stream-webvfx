import Pumper from 'pumper';
import BeatProcessing from './index.js';

var TRACK = '../../audio/pacemaker.mp3';

//Pumper.start(TRACK, 1440, 14000);
Pumper.start('mic', 1440, 14000);
Pumper.globalSpikeTolerance = 14;



var f = new FontFace('Patua One', 'url(../../assets/fonts/PatuaOne-Regular.ttf)', {});
f.load().then(function (loadedFace) {
    document.fonts.add(loadedFace);
    BeatProcessing.init();
});
