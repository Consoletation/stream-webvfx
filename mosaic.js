/* global PIXI */

'use strict';

var geom = require('pex-geom');

var Tile = function(img, x, y) {
    var tex = PIXI.Texture.fromImage('./assets/faces/' + img);
    PIXI.Sprite.prototype.constructor.call(this, tex);
    this.index = {
        x: x,
        y: y
    };
    this.width = 5;
    this.height = 5;
};

Tile.prototype = Object.create(PIXI.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.update = function(size) {
    this.width = this.height = size;
    this.position.x = this.index.x * this.width;
    this.position.y = this.index.y * this.width;
};

var Mosaic = function(image, data) {
    this.data = data;
    this.tiles = [];
    this.image = new Image();
    this.image.src = image;
    this.image.onload = this.ready.bind(this);
};

Mosaic.prototype.ready = function() {
    this.generatePalette();
    this.createRenderer();
    this.createMosaic(10);
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

Mosaic.prototype.generatePalette = function() {
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
    var stage = new PIXI.Stage(0x000000);
    var container = new PIXI.DisplayObjectContainer();
    stage.addChild(container);
    var container = new PIXI.DisplayObjectContainer();
    stage.addChild(container);
    var renderer = PIXI.autoDetectRenderer(1000, 1000);
    renderer.view.style.position = 'absolute';
    renderer.view.style.top = '50%';
    renderer.view.style.left = '50%';
    renderer.view.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(renderer.view);

    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    var self = this;
    var step = 0;

    function anim() {
        stats.begin();
        step += 0.006;
        var size = (Math.sin(step) + 1) * 47 + 6; 
        self.tiles.map(function(tile) {
            tile.update(size);
        });
        container.position.x = (1000 - (size * 100)) / 2;
        container.position.x += Math.sin(step * 2) * (50 + size * 10);
        container.position.y = (1000 - (size * 100)) / 2;
        container.position.y += Math.cos(step * 2) * (50 + size * 10);
        renderer.render(stage);
        stats.end();
        window.requestAnimationFrame(anim);
    }

    window.requestAnimationFrame(anim);

    this.stage = stage;
    this.renderer = renderer;
    this.container = container;
};

Mosaic.prototype.createMosaic = function() {
    var self = this;
    console.log('Creating mosaic from ' + this.image.src);

    var canvas = document.createElement('canvas');
    canvas.width = this.image.width;
    canvas.height = this.image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.image, 0, 0, 100, 100);
    var pixels = ctx.getImageData(0, 0, this.image.width, this.image.height);

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
            chunk.data,
            (coord % this.image.width),
            Math.floor(coord / this.image.width)
        );

        self.tiles.push(tile);
        this.container.addChild(tile);
    }
};

function start() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var data = JSON.parse(request.responseText);
            var mosaic = new Mosaic('./assets/test_mosaic.png', data);
            console.log('Started mosaic:', mosaic);
        }
    };

    request.open('GET', './assets/faces.json');
    request.send();
}

start();
