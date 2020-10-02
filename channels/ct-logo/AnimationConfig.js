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
    main: {},
    low: {},
    lowsplit: {},
};
profiles.main.multipliers = {
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
profiles.main.positions = {
    data: [
        {
            logo: [
                { x: 0, y: 68 },
                { x: 0, y: -68 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: -1600 },
            headings: { y: -900, z: 0 },
            camera: { x: -43, y: 690, z: 1000 },
        },
        {
            logo: [
                { x: 0, y: 68 },
                { x: 0, y: 68 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: -800 },
            headings: { y: -900, z: 0 },
            camera: { x: -43, y: 0, z: 1000 },
        },
        {
            logo: [
                { x: 0, y: 90 },
                { x: 0, y: 90 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: 0 },
            headings: { y: -900, z: 0 },
            camera: { x: -43, y: 0, z: 1000 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
        {
            time: 3200,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
        {
            time: 1200,
            easing: TWEEN.Easing.Bounce.Out,
        },
    ],
};
profiles.main.directions = {
    data: [
        {
            camera: { x: 8, y: 0, z: 0 },
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
profiles.main.references = {
    data: [
        {
            image: {
                current: 0,
                tracker: [1, 5],
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
profiles.low.multipliers = {
    data: [
        {
            letters: {
                high: { y: [0.6, 0.6, 0.6, 0.6], z: [0, 0, 0, 0] },
                mid: { y: [0.2, 0.2, 0.2, 0.2], z: [0, 0, 0, 0] },
                low: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
                global: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            },
            headings: {
                global: { y: 0, z: 0 },
            },
            camera: {
                global: { x: 0, y: 0.2, z: 0 },
            },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Quintic.InOut,
        },
    ],
};
profiles.low.positions = {
    data: [
        {
            logo: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
            ],
            letters: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: 0 },
            headings: { y: -1000, z: 0 },
            camera: { x: -43, y: 100, z: 720 },
        },
    ],
};
profiles.low.positions.tween = profiles.low.multipliers.tween;
profiles.low.directions = {
    data: [
        {
            camera: { x: 0, y: 0, z: 0 },
        },
    ],
    tween: [
        {
            time: 300,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
    ],
};
profiles.low.references = profiles.main.references;
profiles.lowsplit.multipliers = profiles.low.multipliers;
profiles.lowsplit.multipliers = {
    data: [
        {
            letters: {
                high: { y: [0.8, 0.2, 1.4, 1], z: [0, 0, 0, 0] },
                mid: { y: [0.5, 0.1, 0.8, 0.4], z: [0, 0, 0, 0] },
                low: { y: [0, 0, 0, 0], z: [0.5, 0.5, 0.5, 0.5] },
                global: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            },
            headings: {
                global: { y: 0, z: 0 },
            },
            camera: {
                global: { x: 0, y: 0.2, z: 0 },
            },
        },
        {
            letters: {
                high: { y: [0.6, 0.6, 0.6, 0.6], z: [0, 0, 0, 0] },
                mid: { y: [0.2, 0.2, 0.2, 0.2], z: [0, 0, 0, 0] },
                low: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
                global: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            },
            headings: {
                global: { y: 0, z: 0 },
            },
            camera: {
                global: { x: 0, y: 0.2, z: 0 },
            },
        },
    ],
    tween: [
        {
            time: 600,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
        {
            time: 300,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
    ],
};
profiles.lowsplit.positions = {
    data: [
        {
            logo: [
                { x: 0, y: 68 },
                { x: 0, y: -68 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: 0, y: -400 },
            headings: { y: -1100, z: 0 },
            camera: { x: -43, y: 0, z: 720 },
        },
        {
            logo: [
                { x: 259, y: 68 },
                { x: -258, y: -68 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: -88, y: -400 },
            headings: { y: -1100, z: 0 },
            camera: { x: -43, y: 0, z: 720 },
        },
        {
            logo: [
                { x: 259, y: 68 },
                { x: -258, y: -68 },
            ],
            letters: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            image: { x: -88, y: 118 },
            headings: { y: -1100, z: 0 },
            camera: { x: -43, y: 0, z: 520 },
        },
    ],
    tween: [
        {
            time: 600,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
        {
            time: 300,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
        {
            time: 900,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
    ],
};
profiles.lowsplit.directions = profiles.low.directions;
profiles.lowsplit.references = {
    data: [
        {
            image: {
                current: 0,
                tracker: [1, 5],
            },
        },
        {
            image: {
                current: 1,
                tracker: [1, 0],
            },
        },
    ],
    tween: [
        {
            time: 600,
            easing: Round,
        },
        {
            time: 1,
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
            var tween = new TWEEN.Tween(); // Null end
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
