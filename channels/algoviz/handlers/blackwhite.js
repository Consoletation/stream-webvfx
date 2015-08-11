var Pumper = require('pumper'),
    Common = require('./_common');

var TOGGLE_CHANCE = 0.5,
    COLORS = ['black', 'white'],
    EQ_COLORS = [
        Common.BRAND_COLORS.red, 
        Common.BRAND_COLORS.blue, 
        Common.BRAND_COLORS.yellow
    ],
    EQ_COLOR_IDX = 0,
    INVERT_INTERVAL = 1000 / 30,
    TEXT = Common.HASHTAG.toUpperCase();

var bassCheck = Pumper.createBand(40,60);
bassCheck.spikeTolerance = 2;

var _ift = Date.now();
var invert = false;
var scale = 1;

var main;

function setup(mainConfig) {
    main = mainConfig;
}

function update(_t) {
    if(_t - _ift > INVERT_INTERVAL) {
        _ift = _t;
        Pumper.update();

        scale = 0.5 + ((bassCheck.volume / 255) * 2);
        if(bassCheck.isSpiking) {
            EQ_COLOR_IDX++;
            if(EQ_COLOR_IDX >= EQ_COLORS.length) EQ_COLOR_IDX = 0;
        }

        if(Pumper.isSpiking) invert = !invert;
    }
}

function _drawBG() {
    // draw bg
    main.ctx.fillStyle = COLORS[(invert) ? 1 : 0];
    main.ctx.fillRect(0, 0, main.W, main.H);
}

var inner = 60, outer = 200;
function _drawCross() {
    // draw cross
    main.ctx.fillStyle = COLORS[(invert) ? 0 : 1];
    main.ctx.save();
    main.ctx.translate(main.CX, main.CY);
    main.ctx.scale(scale, scale);
    main.ctx.translate(-main.CX, -main.CY);
    main.ctx.fillRect(main.CX - inner, main.CY - outer, inner * 2, outer * 2);
    main.ctx.fillRect(main.CX - outer, main.CY - inner, outer * 2, inner * 2);
    main.ctx.restore();
}

function _drawEQ() {
    var d = Pumper.getData(),
        ln = d.length,
        bl = Math.round((outer) / ln);

    main.ctx.fillStyle = EQ_COLORS[EQ_COLOR_IDX];
    for(var i = 0; i < ln; i++) {
        var w = (outer) * (d[i] / 255);
        main.ctx.fillRect(main.CX - w, main.CY - (i * (bl + 3)), w * 2, bl);
        main.ctx.fillRect(main.CX - w, main.CY + (i * (bl + 3)), w * 2, bl);
    }
}

function _drawText() {
    main.ctx.font = '60px VT323';
    main.ctx.fillStyle = COLORS[(invert) ? 1 : 0];
    main.ctx.textAlign = 'center';
    main.ctx.textBaseline = 'middle';
    main.ctx.fillText(TEXT, main.CX, main.CY);
}

function _drawRasterLines() {
    main.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for(var i = 0; i < main.H; i++) {
        if(i % 2) main.ctx.fillRect(0, i, main.W, 1);
    }
}

function render(_t) {
    _drawBG();
    _drawCross();
    _drawText();
    _drawEQ();
    _drawRasterLines();
}

var BlackWhite = {
    setup: setup,
    update: update,
    render: render
};

module.exports = BlackWhite;