import TWEEN from '@tweenjs/tween.js';

if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
};

function jCopy(object) {
    return JSON.parse(JSON.stringify(object));
};

function Round(k) {
	return Math.round(k);
}

// Animation configurations
const profiles = {
    one: {},
    two: {},
    three: {},
};
profiles.one.multipliers = {
    data: [
        {
            letters: {
                high: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
                mid: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
                low: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
                global: { y: [0, 0, 0, 0], z: [0.5, 0.5, 0.5, 0.5] },
            },
            headings: {
                global: { y: 0.3, z: 0 },
            },
            camera: {
                global: { x: 1, y: 0.3, z: 0.09 },
            },
        },
    ],
    tween: [
        {
            time: 1200,
            easing: TWEEN.Easing.Quintic.InOut,
        },
    ],
};
profiles.one.positions = {
    data: [
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 200, y: 2800 },
            headings: { x: 200, y: -3000, z: 0 },
            camera: { x: -500, y: -90, z: 900 },
        },
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 200, y: 200 },
            headings: { x: 200, y: -1000, z: 0 },
            camera: { x: -500, y: -90, z: 900 },
        },
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: 200 },
            headings: { x: 0, y: -1000, z: 0 },
            camera: { x: -300, y: -90, z: 900 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Quadratic.In,
        },
        {
            time: 600,
            easing: TWEEN.Easing.Quadratic.In,
        },
        {
            time: 3800,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
    ],
};
profiles.one.directions = {
    data: [
        {
            camera: { x: 0, y: 0, z: 0 },
        },
        {
            camera: { x: 0.3, y: 0, z: 0 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Quintic.In,
        },
        {
            time: 1200,
            easing: TWEEN.Easing.Quintic.Out,
        },
    ],
};
profiles.one.references = {
    data: [
        {
            image: {
                current: 1,
                tracker: [1, 0],
            },
        },
    ],
    tween: [
        {
            time: 1200,
            easing: Round,
        },
    ],
};
profiles.two.multipliers = profiles.one.multipliers;
profiles.two.positions = {
    data: [
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: -200, y: 2200 },
            headings: { x: -200, y: -2000, z: 0 },
            camera: { x: 500, y: -90, z: 900 },
        },
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: -200, y: 200 },
            headings: { x: -200, y: -1000, z: 0 },
            camera: { x: 500, y: -90, z: 900 },
        },
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: 200 },
            headings: { x: 0, y: -1000, z: 0 },
            camera: { x: 300, y: -90, z: 900 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Quadratic.In,
        },
        {
            time: 300,
            easing: TWEEN.Easing.Quadratic.In,
        },
        {
            time: 3800,
            easing: TWEEN.Easing.Sinusoidal.Out,
        },
    ],
};
profiles.two.directions = {
    data: [
        {
            camera: { x: -0.3, y: 0, z: 0 },
        },
    ],
    tween: [
        {
            time: 600,
            easing: TWEEN.Easing.Quadratic.InOut,
        },
    ],
};
profiles.two.references = profiles.one.references;
profiles.three.multipliers = {
    data: [
        {
            letters: {
                high: { y: [1, 0.1, 1.95, 1.5], z: [0, 0, 0, 0] },
                mid: { y: [0.5, 0.1, 0.8, 0.4], z: [0, 0, 0, 0] },
                low: { y: [0, 0, 0, 0], z: [1, 1, 1, 1] },
                global: { y: [0, 0, 0, 0], z: [0.5, 0.5, 0.5, 0.5] },
            },
            headings: {
                global: { y: 0.3, z: 0 },
            },
            camera: {
                global: { x: 1, y: 0.3, z: 0.09 },
            },
        },
    ],
    tween: [
        {
            time: 1200,
            easing: TWEEN.Easing.Quintic.InOut,
        },
    ],
};
profiles.three.positions = {
    data: [
        {
            logo: [
                { x: 0, y: 68 },
                { x: 0, y: -68 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: 2000 },
            headings: { x: 0, y: -2000, z: 0 },
            camera: { x: -43, y: -90, z: 1400 },
        },
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: 200 },
            headings: { x: 0, y: -1000, z: 0 },
            camera: { x: -43, y: -90, z: 1400 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Quadratic.InOut,
        },
        {
            time: 3200,
            easing: TWEEN.Easing.Quadratic.Out,
        },
    ],
};
profiles.three.directions = {
    data: [
        {
            camera: { x: 0, y: 0, z: 0 },
        },
        {
            camera: { x: 0, y: 0, z: 0 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Quintic.In,
        },
        {
            time: 3200,
            easing: TWEEN.Easing.Quintic.Out,
        },
    ],
};
profiles.three.references = {
    data: [
        {
            image: {
                current: 0,
                tracker: [1, 0],
            },
        },
    ],
    tween: [
        {
            time: 1200,
            easing: Round,
        },
    ],
};

class AnimationConfig {

    // Set up an active configuration based on 'profile'
    // Tween data configured for all available profiles
    constructor(profile) {
        this.multipliers = jCopy(profiles[profile].multipliers.data.last());
        this.positions = jCopy(profiles[profile].positions.data.last());
        this.directions = jCopy(profiles[profile].directions.data.last());
        this.references = jCopy(profiles[profile].references.data.last());
        this._tweens = {};
        // set up tweens
        for (const [profile, config] of Object.entries(profiles)) {
            this._tweens[profile] = this.setupTween(config);
        };
    };

    // Set up tweens for a profile
    // Handles all presets
    // If we have an intermediate (transition) we set up a chain
    setupTween(config) {
        const tweens = [];
        for (const [preset, settings] of Object.entries(config)) {
            if (preset == 'poositions') {
                var tween = new TWEEN.Tween().onComplete(function() { document.getElementsByTagName("canvas")[0].click(); }); // Null end
            } else {
                var tween = new TWEEN.Tween(); // Null end
            }
            // Go from end to start for tween chain
            for (let i = settings.data.length - 1; i >= 0; i--) {
                var tween2 = new TWEEN.Tween(this[preset])
                    .to(settings.data[i], settings.tween[i].time)
                    .easing(settings.tween[i].easing);
                tween2.chain(tween);
                tween = tween2;
            }
            tweens.push(tween);
        };
        return tweens;
    };

    // Calls the tweens for the specified profile
    transition(profile) {
        this._tweens[profile].forEach(function(tween) {
            tween.start();
        });
    };
};

export default AnimationConfig;
