var Pumper = require('pumper'),
    Common = require('./handlers/_common');

var UPDATE_FPS = 1000 / 30,
    RENDER_FPS = 1000 / 60,
    HANDLER_CHANGE_TIME = 5000;

var handlers = {
    'blackwhite': require('./handlers/blackwhite'),
    'lines': require('./handlers/lines'),
    'tunnel': require('./handlers/tunnel')
};

var handlerIDs = Object.keys(handlers);

var currentHandler;

var _t, _ft, _rft;
var MAIN = {};

var dc = document.createElement('canvas'),
    dctx = dc.getContext('2d');

MAIN.c = document.createElement('canvas');
MAIN.ctx = MAIN.c.getContext('2d');

function _onResize() {
    MAIN.W = window.innerWidth;
    MAIN.H = window.innerHeight;
    MAIN.c.width = dc.width = MAIN.W;
    MAIN.c.height = dc.height = MAIN.H;
    MAIN.CX = Math.round(MAIN.W * 0.5);
    MAIN.CY = Math.round(MAIN.H * 0.5);
}

function setHandler(handlerName) {
    if(!(handlerName in handlers)) return false;
    currentHandler = handlerName;
}

function _setRandomHandler() {
    var k = handlerIDs[Common.getRndInt(0, handlerIDs.length - 1)];
    setHandler(k);
}

function update() {
    _t = Date.now();
    if(_t - _ft > UPDATE_FPS) {
        _ft = _t;
        handlers[currentHandler].update(_t);
    }
}

function render() {
    if(_t - _rft > RENDER_FPS) {
        _rft = _t;
        handlers[currentHandler].render(_t);
        dctx.clearRect(0, 0, MAIN.W, MAIN.H);
        dctx.drawImage(MAIN.c, 0, 0);
    }
}

function frame() {
    requestAnimationFrame(frame);
    update();
    render();
}

function init() {
    dc.id = 'main';
    document.body.appendChild(dc);

    window.addEventListener('resize', _onResize, false);
    window.addEventListener('click', Pumper.play);
    _onResize();

    for(var h in handlers) {
        handlers[h].setup(MAIN);
    }

    _setRandomHandler();
    setInterval(_setRandomHandler, HANDLER_CHANGE_TIME);

    _t = _ft = _rft = Date.now();

    frame();
}


var AlgoViz = {
    init: init
};

module.exports = AlgoViz;
