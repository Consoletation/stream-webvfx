/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Audio = __webpack_require__(1);

	console.log('AUDIO', Audio);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	var Analyzer = __webpack_require__(2),
	    MicInput = __webpack_require__(3);

	function init() {

	    Analyzer.init();
	    MicInput.init(function(stream) {
	        Analyzer.setStreamAsSource(stream);
	    });
	}

	var Audio = {
	    init: init,
	    Analyzer: Analyzer,
	    MicInput: MicInput
	};

	module.exports = Audio;

/***/ },
/* 2 */
/***/ function(module, exports) {

	
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	
	var MIC, micStream;

	var mediaTypes = {
	    audio: true,
	    video: false
	};

	function _onSuccess(stream, callback) {
	    micStream = stream;
	    callback(micStream);
	}

	function _onError(error) {
	    throw 'MicInput: unable to initialize: ' + error;
	}

	function init(callback) {
	    var getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	    getMedia(mediaTypes,
	        function(stream) {
	            _onSuccess(stream, callback);
	        },
	        _onError);
	}

	function getStream() {
	    if (!micStream) throw ('MicInput: not initialized (call init() first)');
	}

	var MicInput = {
	    init: init,
	    getStream: getStream
	}

	module.exports = MicInput;


/***/ }
/******/ ]);