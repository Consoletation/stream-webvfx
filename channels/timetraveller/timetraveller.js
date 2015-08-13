/* global PIXI */
'use strict';

var Pumper = require('pumper');
var Logo = require('./logo');

var LOGOS = [
    'first',
    'second',
    'third',
    'fourth'
];

var TimeTraveller = function() {
    this.width = window.innerWidth;
    this.halfWidth = this.width * 0.5;
    this.height = window.innerHeight;
    this.halfHeight = this.height * 0.5;
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
    document.body.appendChild(this.renderer.view);

    this.stage = new PIXI.Container();

    this.logos = [];
    for (var idx in LOGOS) {
        var logo = new Logo(LOGOS[idx]);
        logo.position.set(this.halfWidth, this.halfHeight);
        logo.anchor.set(0.5);
        this.stage.addChild(logo);
        this.logos.push(logo);
    }

    this.activeLogo = -1;
    this.incrementLogo();
    this._render = this.render.bind(this);
};

TimeTraveller.prototype.incrementLogo = function() {
    this.activeLogo++;
    if (this.activeLogo > 3) {
        this.activeLogo = 0;
    }
    this.logos.map(function(logo) {
        logo.renderable = false;
    });
    this.logos[this.activeLogo].renderable = true;
};

TimeTraveller.prototype.render = function(time) {
    requestAnimationFrame(this._render);
    Pumper.update();
    if (Pumper.isSpiking) {
        if (Math.random() > 0.9) {
            this.incrementLogo();
        }
    }
    this.logos.map(function(logo) {
        logo.update();
    });
    this.renderer.render(this.stage);
};

TimeTraveller.prototype.start = function() {
    requestAnimationFrame(this._render);
};

module.exports = TimeTraveller;
