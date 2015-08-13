/* global PIXI, Stats */

'use strict';

var geom = require('pex-geom');
var Tile = require('./tile');
var TWEEN = require('tween.js');

var Mosaic = function(players, data) {
    this.tiles = [];
    this.data = data;
    this.players = players;

    this.ready();
};

Mosaic.prototype.ready = function() {
    var self = this;

    this.generatePalette();
    this.createRenderer();
    this.createMosaic();
};

Mosaic.prototype.loadAllImages = function(callback) {
    console.log('loading images');
    var data = this.data;
    var count = data.length;

    var onload = function() {
        count--;
        if (count === 0) {
            callback();
        }
    };

    for (var idx = 0; idx < data.length; idx++) {
        var img = new Image();
        img.onload = onload;
        img.src = './assets/faces/' + data[idx].image;
        data[idx].image = img;
    }
};

Mosaic.prototype.generatePalette = function(cb) {
    console.log('Generating spatial palette...');
    var palette = new geom.Octree(
        new geom.Vec3(0, 0, 0),
        new geom.Vec3(255, 255, 255)
    );

    this.data.map(function(pixel) {
        palette.add(
            new geom.Vec3(
                Math.floor(
                    (pixel.kmeans[0][0] + pixel.average[0] + pixel.common[0]) / 3
                ),
                Math.floor(
                    (pixel.kmeans[0][1] + pixel.average[1] + pixel.common[1]) / 3
                ),
                Math.floor(
                    (pixel.kmeans[0][2] + pixel.average[2] + pixel.common[2]) / 3
                )
            ),
            pixel.image
        );
    });
    this.palette = palette;
};

Mosaic.prototype.createRenderer = function() {
    var container = new PIXI.Container();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    var renderer = PIXI.autoDetectRenderer(this.width, this.height, {
        transparent: true
    });

    renderer.view.style.position = 'absolute';
    renderer.view.style.top = '0px';
    renderer.view.style.left = '0px';
    document.body.appendChild(renderer.view);

    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    var self = this;

    var interval = 1000 / 30;

    function anim(time) {
        window.requestAnimationFrame(anim);
        stats.begin();

        TWEEN.update(time);

        var sinStep = Math.sin(time * 0.0002);
        var size = (sinStep + 1) * 52 + 6;
        var scale = size / 110;

        if (scale > 0.99 && self.recreate) {
            self.recreate = false;

            var outTween = new TWEEN.Tween(container).to({alpha: 0.0}, 1000);
            outTween.onComplete(function() {
                self.createMosaic();
            });
            var inTween = new TWEEN.Tween(container).delay(1000).to({alpha: 1.0}, 1000);
            outTween.chain(inTween);
            outTween.start();
        }

        container.scale.x = container.scale.y = scale;
        self.tiles.map(function(tile) {
            tile.adjustTint(scale);
        });

        var xDelta = (50 + 1000 * scale) * Math.sin(time * 0.0003);
        var yDelta = (50 + 1000 * scale) * Math.cos(time * 0.0003);
        container.position.x = (self.width - (size * 100)) * 0.5 + xDelta;
        container.position.y = (self.height - (size * 100)) * 0.5 + yDelta;

        renderer.render(container);

        stats.end();
    }

    window.requestAnimationFrame(anim);

    this.renderer = renderer;
    this.container = container;
};

Mosaic.prototype.createMosaic = function() {
    var self = this;

    var player = this.players[
        Math.floor(Math.random() * this.players.length)
    ];

    var image = new Image();
    image.src = '../../assets/faces/players/' + player;
    image.onload = function() {
        self.tileGeneration(image);
        setTimeout(function() {
            self.recreate = true;
        }, 45000);
    };

};

Mosaic.prototype.tileGeneration = function(image) {
    var self = this;
    console.log('Creating mosaic from ' + image.src);

    var canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 100, 100);
    var pixels = ctx.getImageData(0, 0, 100, 100);

    this.tiles = [];
    this.container.removeChildren();

    for (var idx = 0; idx < pixels.data.length; idx += 4) {
        var pixel = new geom.Vec3(
            pixels.data[idx],
            pixels.data[idx + 1],
            pixels.data[idx + 2]
        );
        var chunk = self.palette.findNearestPoint(pixel, {
            includeData: true
        });

        var coord = Math.floor(idx / 4);

        var tile = new Tile(
            pixel,
            chunk.data,
            (coord % 100),
            Math.floor(coord / 100)
        );

        self.tiles.push(tile);
        this.container.addChild(tile);
    }
};

module.exports = Mosaic;
