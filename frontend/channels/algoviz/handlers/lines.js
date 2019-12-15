var Pumper = require('pumper'),
    Common = require('./_common');

var main;

var lines = [];

var MAX_LINES = 20,
    SEGMENT_SIZE = 10,
    GRAY = 'rgba(34,34,34,0.4)',
    REGEN_CHANCE = 0.5;

var bands = [
    Pumper.createBand(10,15),
    Pumper.createBand(20,30),
    Pumper.createBand(30,35)
];

function _generateLines() {
    lines = [];

    for(var i = 0; i < MAX_LINES; i++) {
        var sx, sy, ex, ey,
            startFromSide = Common.getRndInt(0,1);  // start from t/b or lr

        if(startFromSide) {
            var startSide = Common.getRndInt(0,1), // l,r
            sx = (startSide) ? main.W : 0;
            sy = Common.getRndInt(0, main.H);

            var endEdge = Common.getRndInt(0,2), // t, other side, b
            ex = (endEdge == 1) ? (startSide ? main.W : 0) : Common.getRndInt(0, main.W),
            ey = (endEdge == 1) ? Common.getRndInt(0, main.H) : (endEdge ? 0 : main.H);
        } else {
            var startTopBot = Common.getRndInt(0,1), // t,b
            sx = Common.getRndInt(0, main.W);
            sy = (startTopBot) ? main.H : 0;

            var endEdge = Common.getRndInt(0,2), // l, other topbot, r
            ex = (endEdge == 1) ? Common.getRndInt(0, main.W) : (endEdge ? main.W : 0),
            ey = (endEdge == 1) ? (startTopBot ? 0 : main.H) : Common.getRndInt(0, main.H);
        }

        var color = Common.TRICOLOR[Common.getRndInt(0,2)];
        var band = bands[Common.getRndInt(0,2)];

        var line = new Line(sx, sy, ex, ey, color, i / MAX_LINES, band);
        if(Math.abs(ey - sy) == main.H) {
            line.canMove = true;
            line.motionType = 'horizontal'
        }
        if(Math.abs(sx - ex) == main.W) {
            line.canMove = true;
            line.motionType = 'vertical';
        }
        if (sx !== ex && sy !== ey) lines.push(line);
    }
}

function setup(mainConfig) {
    main = mainConfig;

    _generateLines();
}

function Line(sx, sy, ex, ey, color, speed, band) {

    this.sx = sx;
    this.sy = sy;
    this.ex = ex;
    this.ey = ey;

    this.color = color;
    this.speed = speed;
    this.band = band;

    this._cx = ex;
    this._cy = ey;

    this.canMove = false;
    this.motionType = null;

    this._ofsX = 0;
    this._ofsY = 0;

    var MOTION_RANGE = 200;

    this.update = function(_t) {

        if(this.canMove) {
            if(this.motionType == 'horizontal') {
                this._ofsX = Math.sin(_t * 0.0005 * this.speed) * MOTION_RANGE;
            } else {
                this._ofsY = Math.sin(_t * 0.0005 * this.speed) * MOTION_RANGE;
            }
        }
        var f = this.band.volume / 200;
        
        this._cx = this.sx + (this.ex - this.sx) * f;
        this._cy = this.sy + (this.ey - this.sy) * f;
    }

    this.render = function() {
        main.ctx.strokeStyle = GRAY;
        main.ctx.beginPath();
        main.ctx.moveTo(this._ofsX + this.sx, this._ofsY + this.sy);
        main.ctx.lineTo(this._ofsX + this.ex, this._ofsY + this.ey);
        main.ctx.stroke();
        main.ctx.closePath();

        main.ctx.strokeStyle = this.color;
        main.ctx.beginPath();
        main.ctx.moveTo(this._ofsX + this.sx, this._ofsY + this.sy);
        main.ctx.lineTo(this._ofsX + this._cx, this._ofsY + this._cy);
        main.ctx.stroke();
        main.ctx.closePath();
    }
}

function update(_t) {
    Pumper.update();
    if (Pumper.isSpiking) {
        if(Math.random() < REGEN_CHANCE) _generateLines();
    }
    lines.forEach(function(line) {
        line.update(_t);
    });
}

function _drawLines() {
    main.ctx.lineWidth = 8;
    main.ctx.setLineDash([20,15]);
    lines.forEach(function(line) {
        line.render();
    });
}

function _drawText() {
    main.ctx.font = '200px VT323';
    main.ctx.fillStyle = 'rgba(0,0,0,0.4)';
    main.ctx.textAlign = 'center';
    main.ctx.textBaseline = 'middle';
    main.ctx.fillText(Common.HASHTAG, main.CX, main.CY);
}

function render(_t) {
    main.ctx.clearRect(0, 0, main.W, main.H);
    main.ctx.fillStyle = (Pumper.isSpiking) ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0)';
    main.ctx.fillRect(0, 0, main.W, main.H);
    if(Pumper.isSpiking) _drawText();
    _drawLines();
}

var Lines = {
    setup: setup,
    update: update,
    render: render
};

module.exports = Lines;
