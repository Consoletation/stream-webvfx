
var FFT_SIZE = 256;


var AUDIO;
var analyzerNode, dataArray, bufferLength, sourceNode;
var bindings = {};
var isInit = false;

function _checkInit() {
    if(!isInit) throw('Analyzer error: not initialized (call init() first)');
}

function init(source) {
    AUDIO = new (window.AudioContext || window.webkitAudioContext)();
    if(!AUDIO) console.error('Web Audio API not supported :(');

    analyzerNode = AUDIO.createAnalyser();
    analyzerNode.fftSize = FFT_SIZE;
    bufferLength = analyzerNode.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    isInit = true;

    if(source) setSource(source);

    analyzerNode.connect(AUDIO.destination);
}

function getBinLength() {
    _checkInit();
    return bufferLength;
}

function getBinData() {
    _checkInit();
    analyzerNode.getByteFrequencyData(dataArray);
    return dataArray;
}

function getVolume() {
    _checkInit();
    // TODO
}

function setSourceNode(newSource) {
    _checkInit();
    sourceNode = newSource;
    sourceNode.connect(analyzerNode);
}

function setStreamAsSource(stream) {
    _checkInit();
    var streamNode = AUDIO.createMediaStreamSource(stream);
    setSourceNode(streamNode);
}

function getContext() {
    _checkInit();
    return AUDIO;
}

var Analyzer = {
    init: init,
    getContext: getContext,
    setSource: setSource,
    getBinData: getBinData,
    getBinLength: getBinLength,
    getFreqData: getFreqData,
    getTimeData: getTimeData
}

module.exports = Analyzer;