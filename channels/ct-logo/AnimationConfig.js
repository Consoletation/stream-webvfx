import TWEEN from '@tweenjs/tween.js';

function jCopy(object) {
    return JSON.parse(JSON.stringify(object));
};


// Animation configurations
const profiles = {
    main: {},
    low: {},
};
profiles.main.multipliers = {
    base: {
        logo: {
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
    tween: {
        base: {
            time: 1200,
            easing: TWEEN.Easing.Quintic.InOut,
        },
    },
};
profiles.main.positions = {
    base: {
        logo: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
        headings: { y: -900, z: 0 },
        camera: { x: -43, y: -90, z: 1000 },
    },
};
profiles.main.positions.tween = profiles.main.multipliers.tween;
profiles.main.directions = {
    base: {
        camera: { x: 0, y: 0, z: 0 },
    },
    transition: {
        camera: { x: 0.18, y: 0, z: 0 },
    },
    tween: {
        base: {
            time: 1200,
            easing: TWEEN.Easing.Sinusoidal.Out,
        },
        transition: {
            time: 600,
            easing: TWEEN.Easing.Sinusoidal.In,
        },
    },
};
profiles.low.multipliers = {
    base: {
        logo: {
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
    tween: {
        base: {
            time: 300,
            easing: TWEEN.Easing.Quintic.InOut,
        },
    },
};
profiles.low.positions = {
    base: {
        logo: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
        headings: { y: -1000, z: 0 },
        camera: { x: -43, y: 100, z: 720 },
    },
};
profiles.low.positions.tween = profiles.low.multipliers.tween;
profiles.low.directions = {
    base: {
        camera: { x: 0, y: 0, z: 0 },
    },
    tween: {
        base: {
            time: 300,
            easing: TWEEN.Easing.Sinusoidal.InOut,
        },
    },
};

class AnimationConfig {

    // Set up an active configuration based on 'profile'
    // Tween data configured for all available profiles
    constructor(profile) {
        this.multipliers = jCopy(profiles[profile].multipliers.base);
        this.positions = jCopy(profiles[profile].positions.base);
        this.directions = jCopy(profiles[profile].directions.base);
        this._tweens = {};
        // set up tweens
        for (const [profile, config] of Object.entries(profiles)) {
            this._tweens[profile] = this.setupTween(config);
        };
    };

    // Set up tweens for a profile
    // Handles the three presets (multipliers, positions, directions)
    // If we have an intermediate (transition) we set up a chain
    setupTween(config) {
        const tweens = [];
        for (const [preset, data] of Object.entries(config)) {
            let tween = new TWEEN.Tween(this[preset])
                .to(data.base, data.tween.base.time)
                .easing(data.tween.base.easing);
            if ('transition' in data.tween) {
                let tween2 = new TWEEN.Tween(this[preset])
                    .to(data.transition, data.tween.transition.time)
                    .easing(data.tween.transition.easing);
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
