/* global PIXI */
'use strict';

var Pumper = require('pumper');

var Logo = function(which) {
    var texture = PIXI.Texture.fromImage(
        '../../assets/logos/' + which + '.png'
    );
    PIXI.Sprite.prototype.constructor.call(this, texture);

    this.defaultScale = 0.4;
    this.pumpScale = 0.9;
};

Logo.prototype = Object.create(PIXI.Sprite.prototype);
Logo.prototype.constructor = Logo;

Logo.prototype.update = function() {
    if (Pumper.isSpiking) {
        this.scale.set(this.pumpScale);
    }
    this.scale.set(this.scale.x - (this.scale.x - this.defaultScale) * 0.02);
};

module.exports = Logo;
