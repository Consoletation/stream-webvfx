/* global PIXI, Proton */
'use strict';

var Pumper = require('pumper');
var Logo = require('./logo');
var TWEEN = require('tween.js');

var LOGOS = [
    'first',
    'second',
    'third',
    'fourth'
];

var COLORS = [
    PIXI.Texture.fromImage('../../assets/pix_r.jpg'),
    PIXI.Texture.fromImage('../../assets/pix_b.jpg'),
    PIXI.Texture.fromImage('../../assets/pix_y.jpg')
];

var TimeTraveller = function() {
    this.width = window.innerWidth;
    this.halfWidth = this.width * 0.5;
    this.height = window.innerHeight;
    this.halfHeight = this.height * 0.5;
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
    document.body.appendChild(this.renderer.view);

    this.setupProton();

    this.stage = new PIXI.Container();
    this.fireworks = new PIXI.Container();
    this.stage.addChild(this.fireworks);

    this.hype = new PIXI.Text(
        '- HYPE',
        {
            font: '20px Roboto',
            weight: 'bold',
            fill: 0xFFFFFF,
            align: 'left'
        }
    );

    this.hype.anchor.set(0, 0.5);

    // this.stage.addChild(this.hype);

    this.logos = [];
    for (var idx in LOGOS) {
        var logo = new Logo(LOGOS[idx]);
        logo.position.set(this.halfWidth, this.halfHeight);
        logo.anchor.set(0.5);
        this.stage.addChild(logo);
        this.logos.push(logo);
    }

    this.flashes = [
        new PIXI.Sprite(PIXI.Texture.fromImage('../../assets/pix_r.jpg')),
        new PIXI.Sprite(PIXI.Texture.fromImage('../../assets/pix_b.jpg')),
        new PIXI.Sprite(PIXI.Texture.fromImage('../../assets/pix_y.jpg'))
    ];

    this.flashes[0].width = this.width;
    this.flashes[0].height = this.height;
    this.flashes[0].alpha = 0.0;
    this.stage.addChild(this.flashes[0]);
    this.flashes[1].width = this.width;
    this.flashes[1].height = this.height;
    this.flashes[1].alpha = 0.0;
    this.stage.addChild(this.flashes[1]);
    this.flashes[2].width = this.width;
    this.flashes[2].height = this.height;
    this.flashes[2].alpha = 0.0;
    this.stage.addChild(this.flashes[2]);

    this.hypeLevel = 0.0;
    this._render = this.render.bind(this);
};

TimeTraveller.prototype.setupProton = function() {
    var self = this;
    this.proton = new Proton();
    this.protonRenderer = new Proton.Renderer('other', this.proton);
    this.protonRenderer.onParticleCreated = function(particle) {
        particle.sprite = new PIXI.Sprite(particle.target);
        self.fireworks.addChild(particle.sprite);
    };
    this.protonRenderer.onParticleUpdate = function(particle) {
        particle.sprite.x = particle.p.x;
        particle.sprite.y = particle.p.y;
        particle.sprite.scale.x = particle.scale;
        particle.sprite.scale.y = particle.scale;
        particle.sprite.anchor.set(0.5);
        particle.sprite.alpha = particle.alpha;
        particle.sprite.rotation = particle.rotation * Math.PI / 180;
    };
    this.protonRenderer.onParticleDead = function(particle) {
        self.fireworks.removeChild(particle.sprite);
    };
    this.protonRenderer.start();
};

TimeTraveller.prototype.setLogo = function(id) {
    if (this.activeLogo === id) {
        return;
    }

    if (id > this.activeLogo) {
        this.makeFlash();
        this.hypeLevel += 10;  // hype boost for breaking level
        this.makeFirework();
        this.makeFirework();
        this.makeFirework();
    }
    this.activeLogo = id;
    if (this.activeLogo > 3) {
        this.activeLogo = 0;
    }
    this.logos.map(function(logo) {
        logo.renderable = false;
    });
    this.logos[this.activeLogo].renderable = true;
};

TimeTraveller.prototype.makeFlash = function() {
    var flash = this.flashes[Math.floor(Math.random() * 3)];
    flash.alpha = 1.0;
    var tween = new TWEEN.Tween(flash).to({alpha: 0.0}, 600);
    tween.start();
};

TimeTraveller.prototype.makeBigFirework = function(color) {
    var texture = COLORS[color];
    var emitter = new Proton.BehaviourEmitter();
    emitter.rate = new Proton.Rate(
        new Proton.Span(15, 20),
        new Proton.Span(0.2, 1)
    );
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.ImageTarget(texture));
    emitter.addInitialize(new Proton.Life(0.5, 2));
    emitter.addInitialize(new Proton.Velocity(
        new Proton.Span(3, 7),
        new Proton.Span(0, 20, true),
        'polar'
    ));

    emitter.addBehaviour(new Proton.Gravity(6));
    emitter.addBehaviour(new Proton.Scale(new Proton.Span(5, 10), 0.3));
    emitter.addBehaviour(new Proton.Alpha(1, 0.5));
    emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
    emitter.p.x = Math.random() * this.width;
    emitter.p.y = Math.random() * this.height;
    emitter.emit();
    this.proton.addEmitter(emitter);
    emitter.addSelfBehaviour(new Proton.Gravity(4));
    emitter.addSelfBehaviour(new Proton.RandomDrift(30, 30, .1));
    emitter.addSelfBehaviour(new Proton.CrossZone(
        new Proton.RectZone(50, 0, this.width - 50, this.height - 50), 'bound'
    ));
};

TimeTraveller.prototype.makeFirework = function() {
    var texture = COLORS[Math.floor(Math.random() * 3)];
    var emitter = new Proton.BehaviourEmitter();
    emitter.rate = new Proton.Rate(
        new Proton.Span(15, 20),
        new Proton.Span(0.2, 0.5)
    );
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.ImageTarget(texture));
    emitter.addInitialize(new Proton.Life(0.5, 1));
    emitter.addInitialize(new Proton.Velocity(
        new Proton.Span(3, 7),
        new Proton.Span(0, 20, true),
        'polar'
    ));

    emitter.addBehaviour(new Proton.Gravity(6));
    emitter.addBehaviour(new Proton.Scale(new Proton.Span(3, 7), 0.3));
    emitter.addBehaviour(new Proton.Alpha(1, 0.5));
    emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
    emitter.p.x = Math.random() * this.width;
    emitter.p.y = Math.random() * this.height;
    emitter.emit();
    this.proton.addEmitter(emitter);
    emitter.addSelfBehaviour(new Proton.Gravity(4));
    emitter.addSelfBehaviour(new Proton.RandomDrift(30, 30, .1));
    emitter.addSelfBehaviour(new Proton.CrossZone(
        new Proton.RectZone(50, 0, this.width - 50, this.height - 50), 'bound'
    ));
};

TimeTraveller.prototype.render = function(time) {
    requestAnimationFrame(this._render);

    this.hypeLevel -= 0.06;
    if (this.hypeLevel < 0) {
        this.hypeLevel = 0;
    } else if (this.hypeLevel > 120) {
        this.hypeLevel = 120;
    }

    if (this.hypeLevel > 100) {
        this.setLogo(3);
    } else if (this.hypeLevel > 60) {
        this.setLogo(2);
    } else if (this.hypeLevel > 25) {
        this.setLogo(1);
    } else {
        this.setLogo(0);
    }

    Pumper.update();
    this.proton.update();
    TWEEN.update(time);
    if (Pumper.isSpiking) {
        this.hypeLevel += 3;
        if (Math.random() > 0.9 && this.activeLogo === 3) {
            this.makeBigFirework(0);
            this.makeBigFirework(1);
            this.makeBigFirework(2);
        }
        if (Math.random() > 0.85 && this.activeLogo === 3) {
            this.makeFlash();
        }
    }
    this.logos.map(function(logo) {
        logo.update();
    });

    this.hype.x = 10;
    this.hype.y = (this.height - this.height * (this.hypeLevel / 100));
    this.renderer.render(this.stage);
};

TimeTraveller.prototype.start = function() {
    requestAnimationFrame(this._render);
};

module.exports = TimeTraveller;
