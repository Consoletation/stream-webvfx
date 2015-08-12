/* global PIXI */

'use strict';

var Tile = function(img, x, y) {
    var tex = PIXI.Texture.fromImage('../../assets/faces/' + img);
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

module.exports = Tile;
