/* global PIXI */

'use strict';

var Tile = function(color, img, x, y) {
    this.color = color;
    var tex = PIXI.Texture.fromImage('../../assets/faces/' + img);
    PIXI.Sprite.prototype.constructor.call(this, tex);
    this.index = {
        x: x,
        y: y
    };
    this.position.x = x * 100;
    this.position.y = y * 100;
    this.width = this.height = 100;

    this.adjustTint(0.0);
};

Tile.prototype = Object.create(PIXI.Sprite.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.adjustTint = function(value) {
    this.tint = this.color.x + (255 - this.color.x) * value;
    this.tint = (this.tint << 8) + this.color.y + (255 - this.color.y) * value;
    this.tint = (this.tint << 8) + this.color.z + (255 - this.color.z) * value;
};

module.exports = Tile;
