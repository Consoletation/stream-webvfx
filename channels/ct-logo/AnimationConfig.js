import TWEEN from '@tweenjs/tween.js';

function jCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

const AnimationConfig = function() {
    this.profiles = {};

    // Main profile
    this.profiles.main = {};
    this.profiles.main.multipliers = {
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
    this.profiles.main.positions = {
        base: {
            logo: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            headings: { y: -900, z: 0 },
            camera: { x: -43, y: -90, z: 1000 },
        },
    };
    this.profiles.main.positions.tween = this.profiles.main.multipliers.tween;
    this.profiles.main.directions = {
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

    // Low profile
    this.profiles.low = {};
    this.profiles.low.multipliers = {
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
    this.profiles.low.positions = {
        base: {
            logo: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            headings: { y: -1000, z: 0 },
            camera: { x: -43, y: 100, z: 720 },
        },
    };
    this.profiles.low.positions.tween = this.profiles.low.multipliers.tween;
    this.profiles.low.directions = {
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

    // Functions
    this.loadProfile = function(profile) {
        this.current = {
            multipliers: jCopy(this.profiles[profile].multipliers.base),
            positions: jCopy(this.profiles[profile].positions.base),
            directions: jCopy(this.profiles[profile].directions.base),
        };
        return this.current;
    }
    this.setupTweens = function() {
        this.transition = {};
        // Set up profiles
        this.transition.main = {};
        this.transition.main.tweens = [];
        // These won't work
        this.transition.main.start = function() {
            this.transition.main.tweens.forEach(function(tween) {
                tween.start();
            });
        };
        this.transition.low = {};
        this.transition.low.tweens = [];
        // These won't work
        this.transition.low.start = function() {
            this.transition.low.tweens.forEach(function(tween) {
                tween.start();
            });
        };
        // Set up tweens
        let current = this.current;
        let main = this.profiles.main;
        let low = this.profiles.low;
        const mainMultipliers = new TWEEN.Tween(current.multipliers)
            .to(main.multipliers.base, main.multipliers.tween.base.time)
            .easing(main.multipliers.tween.base.easing);
        const mainPositions = new TWEEN.Tween(current.positions)
            .to(main.positions.base, main.positions.tween.base.time)
            .easing(main.positions.tween.base.easing);
        const mainDirections = new TWEEN.Tween(current.directions)
            .to(main.directions.transition, main.directions.tween.transition.time)
            .easing(main.directions.tween.transition.easing);
        const mainDirections2 = new TWEEN.Tween(current.directions)
            .to(main.directions.base, main.directions.tween.base.time)
            .easing(main.directions.tween.base.easing);
        mainDirections.chain(mainDirections2);
        this.transition.main.tweens.push(
            mainMultipliers,
            mainPositions,
            mainDirections
        );
        const lowMultipliers = new TWEEN.Tween(current.multipliers)
            .to(low.multipliers.base, low.multipliers.tween.base.time)
            .easing(low.multipliers.tween.base.easing);
        const lowPositions = new TWEEN.Tween(current.positions)
            .to(low.positions.base, low.positions.tween.base.time)
            .easing(low.positions.tween.base.easing);
        const lowDirections = new TWEEN.Tween(current.directions)
            .to(low.directions.transition, low.directions.tween.base.time)
            .easing(low.directions.tween.base.easing);
        this.transition.low.tweens.push(
            lowMultipliers,
            lowPositions,
            lowDirections
        );
    };
};

export default AnimationConfig;
