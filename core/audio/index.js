var DEFAULTS = {
    threshold: 127,
    spikeTolerance: 30
};

var RANGE_START = 10,
    RANGE_END = 90;

function __err(msg) {
    throw 'Pumper error: ' + msg;
}

function __warn(msg) {
    throw 'Pumper: ' + msg;
}

var AUDIO, source, analyzer, bufferLength, dataArray, micStream;


/**
 * 'Band' (frequency range) class.
 **/
function Band(start, end, threshold, spikeTolerance) {
    if (start === undefined || end === undefined) __throw('Band creation requires start and end params');

    this.start = start;
    this.end = end;
    this.threshold = (threshold === undefined) ? DEFAULTS.threshold : threshold;
    this.spikeTolerance = (spikeTolerance === undefined) ? DEFAULTS.spikeTolerance : spikeTolerance;

    this.volume = 0;
    this._calcTotal = 0;

    this.isOverThreshold = false;
    this.isSpiking = false;

    this._onSpike = function(spikeAmount) {
        // TODO: fire event

    };

    this._onThreshold = function() {
        var over = this.volume - this.threshold;
        // TODO: fire event

    };
}

var Pumper = {};

Pumper.volume = 0;
Pumper.isSpiking = false;
Pumper.isOverThreshold = false;
Pumper.globalThreshold = DEFAULTS.threshold;
Pumper.globalSpikeTolerance = DEFAULTS.spikeTolerance;
Pumper.sensitivity = 1;
Pumper.bands = [];

/**
 * Start the engine.
 * @param source - audio URL or 'mic'
 **/
Pumper.start = function(srcValue, autoPlay) {
    if (!srcValue) __err('Missing "source" param');

    if (autoPlay === undefined) autoPlay = false;

    // Init Web Audio API context
    AUDIO = new(window.AudioContext || window.webkitAudioContext)();
    if (!AUDIO) __err('Web Audio API not supported :(');

    // Set up analyzer
    analyzer = AUDIO.createAnalyser();
    analyzer.fftSize = 256;
    bufferLength = analyzer.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    if (srcValue === 'mic') {
        // Request mic access, create source node and connect to analyzer
        navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        navigator.getMedia({
                audio: true,
                video: false
            },
            function(stream) {
                micStream = stream;
                // TODO: throw 'ready' event
                source = AUDIO.createMediaStreamSource(stream);
                source.connect(analyzer);
                analyzer.connect(AUDIO.destination);
                console.log('Pumper: mic stream ready');
            },
            function(error) {
                __err('Error opening microphone stream');
            }
        );
    } else {
        // Load track, create source node and connect to analyzer
        var track = document.createElement('audio');
        track.setAttribute('src', srcValue);
        track.autoplay = autoPlay;
        track.crossOrigin = 'anonymous';
        source = AUDIO.createMediaElementSource(track);
        source.connect(analyzer);
        analyzer.connect(AUDIO.destination);

        track.addEventListener('loadeddata', function() {
            // TODO: throw 'ready' event
            console.log('Pumper: track ready', source);
        }, false);
    }
};

/**
 * Plays the source node if it's a media element.
 **/
Pumper.play = function() {
    if (!source instanceof MediaElementAudioSourceNode) {
        __warn('Source is not ready or is not a media element');
        return false;
    }
    source.mediaElement.play();
};

/**
 * Create a new freq watcher (band)
 **/
Pumper.createBand = function(start, end, threshold, spikeTolerance) {
    var b = new Band(start, end, threshold, spikeTolerance);
    Pumper.bands.push(b);
    return b;
};

/**
 * Performs analysis on the current audio, updates any registered bands.
 **/
Pumper.update = function() {
    analyzer.getByteFrequencyData(dataArray);

    var rangeSize = RANGE_END - RANGE_START,
        globTotal = 0;

    // Calc global volume
    for (var i = RANGE_START; i < RANGE_END; i++) {
        globTotal += dataArray[i];
    }
    // TODO: add sensitivity control

    // TODO: fire global events
    var gvol = globTotal / rangeSize;
    if (gvol - Pumper.volume > Pumper.globalSpikeTolerance) {
        Pumper.isSpiking = true;
    } else {
        Pumper.isSpiking = false;
    }
    Pumper.volume = gvol;
    if (Pumper.volume >= Pumper.globalThreshold) {
        Pumper.isOverThreshold = true;
    } else {
        Pumper.isOverThreshold = false;
    }

    // Calc band volume levels
    Pumper.bands.forEach(function(band) {
        var total = 0;
        for (var i = band.start; i < band.end; i++) {
            total += dataArray[i];
        }
        var vol = total / (band.end - band.start);
        if (vol - band.volume > band.spikeTolerance) {
            band.isSpiking = true;
            band._onSpike(vol - band.volume);
        } else {
            band.isSpiking = false;
        }
        band.volume = vol;
        if (band.volume >= band.threshold) {
            band.isOverThreshold = true;
            band._onThreshold();
        } else {
            band.isOverThreshold = false;
        }
    });
};

Pumper.getData = function() {
    return dataArray;
};

module.exports = Pumper;