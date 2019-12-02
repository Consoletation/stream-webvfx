var Pumper = require('pumper'),
    Common = require('./_common');

var main;

var SPEED = 2,
    NUM_SEGS = 350,
    NUM_STARS = 40,
    DRIFT_DIST = 300,
    X_DRIFT = 0.09,
    Y_DRIFT = 0.1,
    SEG_SIZE = 20,
    SHAPE_SIZE = 50,
    FOV = 200,
    DRAW_DIST = 300,
    STROKE_SIZE = 10,
    STAR_SPEED = 5,
    TOTAL_LEN = NUM_SEGS * SEG_SIZE;

var segments = [],
    stars = [];
var travelDist = 0;

var CAM = {
    x: 0,
    y: 0,
    z: 0
}

function _pX(x, s) {
    return Math.round((CAM.x + x) * s + main.CX);
}

function _pY(y, s) {
    return Math.round((CAM.y + y) * s + main.CY);
}

var Shapes = {
    'square': function(ox, oy, size, s) {
        var x = _pX(ox, s),
            y = _pY(oy, s),
            hs = (size * 0.5),
            x1 = _pX(ox - hs, s),
            y1 = _pY(oy - hs, s),
            x2 = _pX(ox + hs, s),
            y2 = _pY(oy + hs, s),
            w = x2 - x1,
            h = y2 - y1;
        
        main.ctx.strokeRect(x1, y1, w, h);
    },
    'circle': function(ox, oy, size, s) {
        var x = _pX(ox, s),
            y = _pY(oy, s),
            hs = (size * 0.5),
            rad = Math.round(hs * s);
        main.ctx.beginPath();
        main.ctx.arc(x, y, rad, Math.PI * 2, 0, false);
        main.ctx.stroke();
    },
    'triangle': function(ox, oy, size, s) {
        var x = _pX(ox, s),
            y = _pY(oy, s),
            hs = (size * 0.5),
            x1 = _pX(ox - hs, s),
            y1 = _pY(oy - hs, s),
            x2 = _pX(ox + hs, s),
            y2 = _pY(oy + hs, s);
        main.ctx.beginPath();
        main.ctx.moveTo(x, y1);
        main.ctx.lineTo(x2, y2);
        main.ctx.lineTo(x1, y2);
        main.ctx.closePath();
        main.ctx.stroke();
    }
}
var shapeNames = Object.keys(Shapes);

function getRndShape() {
    return shapeNames[Common.getRndInt(0,shapeNames.length - 1)];
}

function setup(mainConfig) {
    main = mainConfig;

    for(var i = 0; i < NUM_SEGS; i++) {
        var s = {
            id: i,
            name: getRndShape(),
            x: Math.sin(i * X_DRIFT) * DRIFT_DIST,
            y: Math.sin(i * Y_DRIFT) * DRIFT_DIST,
            z: i * SEG_SIZE,
            r: 0.5 + (Math.sin(i * 0.1) * 0.5),//Math.random(),
            light: 0.2 + (Math.abs(Math.sin(i * 0.5) * 0.8)),
            special: (i % 5 === 0),
            color: Common.TRICOLOR_RGB[Common.getRndInt(0,2)]
        };
        segments.push(s);
    }

    for(var i = 0; i < NUM_STARS; i++) {
        var baseF = 10;
        stars.push({
            f: baseF + i,   // target freq band
            x: 0,
            y: 0,
            s: Common.getRndInt(2,6), // size
        });
    }
    _positionStars();
}

function _positionStars() {
    var range = DRIFT_DIST * 1.5;
    stars.forEach(function(star) {
        star.x = main.CX + Common.getRndInt(-range, range);
        star.y = main.CY + Common.getRndInt(-range, range);
    });
}


var scalar = 0.5;

function update(_t) {

    Pumper.update();
    if(Pumper.isSpiking) scalar = 2;
    if(scalar > 0.2) scalar -= (scalar - 0.5) * 0.1;
    
}

function _drawShape(shape, maxDist, zofs) {

    if (zofs === undefined) zofs = 0;

    // Don't draw if behind camera vision or beyond draw distance
    var pz = CAM.z - travelDist + shape.z + zofs;
    if (pz > maxDist) return;
    if (pz < 0) return;
    
    // Calculate scaling factor
    var s = FOV / pz;
    var f = (Pumper.volume / 127);
    var size = (SHAPE_SIZE * 0.5) + (f * SHAPE_SIZE * scalar);

    // Draw shape
    var alpha = (1 - ((pz / maxDist) *2)),// * shape.light,
        rs = Math.round(shape.color[0] * alpha),
        gs = Math.round(shape.color[1] * alpha),
        bs = Math.round(shape.color[2] * alpha);

    main.ctx.lineWidth = STROKE_SIZE * (alpha);
    if(shape.special && Pumper.isSpiking && pz < (maxDist * 0.5)) {
        main.ctx.strokeStyle = 'white';//rgba(255,255,255,' + alpha + ')';
    } else {
        main.ctx.strokeStyle = 'rgba(' + rs + ',' + gs + ',' + bs + ',1)';
    }

    var x = _pX(shape.x, s),
        y = _pY(shape.y, s);
    
    main.ctx.save();
    main.ctx.translate(x, y);
    main.ctx.rotate(Common.R_360 * shape.r);
    main.ctx.translate(-x, -y);
    Shapes[shape.name](shape.x, shape.y, size, s);
    main.ctx.restore();
    
}

function _moveCamera(_t) {
    travelDist += SPEED;
    if (travelDist >= TOTAL_LEN) travelDist = 0;
    
    var currentSegId = Math.floor(travelDist / SEG_SIZE),
        nextSegId = (currentSegId < NUM_SEGS - 1) ? currentSegId + 1 : 0,
        segProgress = (travelDist % SEG_SIZE) / SEG_SIZE,
        xofs = segments[nextSegId].x - segments[currentSegId].x,
        yofs = segments[nextSegId].y - segments[currentSegId].y,
        xdiff = xofs * segProgress,
        ydiff = yofs * segProgress;

    CAM.x = -segments[currentSegId].x - xdiff;
    CAM.y = -segments[currentSegId].y - ydiff;  
}

function _drawStars() {
    stars.forEach(function(star) {
        star.y -= STAR_SPEED * (star.s / 6);
        if(star.y < -10) {
            var range = DRIFT_DIST * 1.5;
            star.y = main.H + 10;
            star.x = main.CX + Common.getRndInt(-range, range);
            star.s = Common.getRndInt(2,6);
        }
        var f = Pumper.freqData[star.f];
        if(f > Pumper.globalThreshold) {
            var brightness = 0.2 + ((f - Pumper.globalThreshold) / (255 - Pumper.globalThreshold) * 0.8);
            main.ctx.fillStyle = 'rgba(255,255,255,' + brightness + ')';
            main.ctx.fillRect(star.x, star.y, star.s, star.s);
        }
    });
}

function _drawTunnel() {
     // Calculate closest and farthest segment to the camera,
    // based on our current travel position
    var currentSegId = Math.floor(travelDist / SEG_SIZE),
        farSegId = currentSegId + DRAW_DIST;

    // Draw the segments from farthest to nearest
    var cid = farSegId;
    var maxDist = DRAW_DIST;
    
    while (cid >= currentSegId) {
        var segid, zofs;

        // Draw the correct segments from the start of the segs array
        // if we have looped back to the beginning
        if (cid >= NUM_SEGS) {
            segid = cid - NUM_SEGS;
            zofs = NUM_SEGS * SEG_SIZE;
        } else {
            segid = cid;
            zofs = 0;
        }

        _drawShape(segments[segid], maxDist, zofs);
        cid--;
    }
}

function _drawUI() {
    main.ctx.font = '30px VT323';
    main.ctx.textAlign = 'left';
    main.ctx.textBaseline = 'top';
    main.ctx.fillStyle = 'white';
    main.ctx.fillText(Common.HASHTAG.toUpperCase(), main.CX - DRIFT_DIST, 10);

    main.ctx.textAlign = 'right';
    main.ctx.fillText('DIST ' + travelDist * 1000, main.CX + DRIFT_DIST, 10);
    main.ctx.fillText('PUMP ' + ((Pumper.volume / 255) * 100).toFixed(2) + '%', main.CX + DRIFT_DIST, 40);
}

function _drawRasterLines() {
    main.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    for(var i = 0; i < main.H; i++) {
        if(i % 4 === 0) main.ctx.fillRect(0, i, main.W, 1);
    }
}

function render(_t) {
    _moveCamera(_t);
    
    main.ctx.clearRect(0, 0, main.W, main.H);
    main.ctx.setLineDash([]);

    _drawStars();
    _drawTunnel();
    _drawUI();
    _drawRasterLines();
}

var Tunnel = {
    setup: setup,
    update: update,
    render: render,
    canvasSize: 600
};

module.exports = Tunnel;
