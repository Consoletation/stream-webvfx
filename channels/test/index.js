var Audio = require('../../core/audio');

var c, ctx;
var data, dataLength;

var CW = 600,
    CH = 300,
    BAR_WIDTH = 5;

function update() {
    data = Audio.Analyzer.getBufferData();
    dataLength = Audio.Analyzer.getBufferLength();
}

function render() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = 'red';
    for(var i = 0; i < dataLength; i++) {

        var f = data[i],
            x = i * BAR_WIDTH,
            h = CH * (f / 255),
            y = CH - h;

        ctx.fillRect(x, y, BAR_WIDTH, h);
    }
}

function frame() {
    requestAnimationFrame(frame);
    update();
    render();
}

function init() {
    c = document.createElement('canvas'),
    ctx = c.getContext('2d');

    c.width = CW;
    c.height = CH;

    document.body.appendChild(c);

    frame();
}

var Test = {
    init: init
}

module.exports = Test;