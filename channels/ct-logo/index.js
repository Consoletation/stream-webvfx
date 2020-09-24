import * as THREE from 'three';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { TestShader } from '../../libs/three/shaders/TestShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from '../../libs/three/postprocessing/GlitchPassCustom.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

import Pumper from 'pumper';
import OBSWebSocket from 'obs-websocket-js';
import TWEEN from '@tweenjs/tween.js';

function jCopy(object) {
    return JSON.parse(JSON.stringify(object));
}

// Static globals
const obsClient = new OBSWebSocket(); // OBS client
const headingsMesh = [];
const headings = [
    'Starting soon...',
    'Taking a quick break!',
    'Thanks for watching!'
];
const config = {
    transparent: {
        bgColor: [0x000000, 0],
        textColor: 0xffffff,
        typeFace: 'rigid-square',
        logoImage: 'controller-white.png',
        logoImageSize: 256,
        vignette: {
            offset: 0.0,
            darkness: 0.0,
        },
        filmGrain: [0, 0, 648, false]
    },
    classic: {
        bgColor: [0xffffff, 1],
        textColor: 0x000000,
        typeFace: 'rigid-square',
        logoImage: 'controller.png',
        logoImageSize: 256,
        vignette: {
            offset: 0.5,
            darkness: 1.6,
        },
        filmGrain: [0.12, 0.125, 648, false]
    }
};

// Globals updated via init()
let camera, scene, renderer, composer, glitchPass;
let baseCameraDirection = new THREE.Vector3;
let currentConfig = config.transparent; // Default config
// Globals updated via init() or update()
let cameraDirection = new THREE.Vector3;
let logo;
let logoImageMesh;
let headingsContainer; // Updated by click() or OBS events
let currentHeading = 0;
let mainView = true;
let mainViewUpdate = true;

const animConfigs = new function() {
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
    }
    this.profiles.main.positions = {
        base: {
            logo: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            headings: { y: -900, z: 0 },
            camera: { x: -43, y: -90, z: 1000 },
        },
    }
    this.profiles.main.directions = {
        base: {
            camera: { x: 0, y: 0, z: 0 },
        },
        transition: {
            camera: { x: 0.18, y: 0, z: 0 },
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
    }
    this.profiles.low.positions = {
        base: {
            logo: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            headings: { y: -1000, z: 0 },
            camera: { x: -43, y: 100, z: 720 },
        },
    }
    this.profiles.low.directions = {
        base: {
            camera: { x: 0, y: 0, z: 0 },
        },
    };
    this.profiles.low.directions.transition = this.profiles.low.directions.base; // Compat
}

// Current animation presets
// Updated via tweens and applied within update()
let currAnimConfig = {
    multipliers: jCopy(animConfigs.profiles.main.multipliers.base),
    positions: jCopy(animConfigs.profiles.main.positions.base),
    directions: jCopy(animConfigs.profiles.main.directions.base),
};

// Set up tweens
const newTweenMultipliersLow = new TWEEN.Tween(currAnimConfig.multipliers)
    .to(animConfigs.profiles.low.multipliers.base, 300)
    .easing(TWEEN.Easing.Quintic.InOut);
const newTweenMultipliersMain = new TWEEN.Tween(currAnimConfig.multipliers)
    .to(animConfigs.profiles.main.multipliers.base, 1200)
    .easing(TWEEN.Easing.Quintic.InOut);
const newTweenPositionsLow = new TWEEN.Tween(currAnimConfig.positions)
    .to(animConfigs.profiles.low.positions.base, 300)
    .easing(TWEEN.Easing.Quintic.InOut);
const newTweenPositionsMain = new TWEEN.Tween(currAnimConfig.positions)
    .to(animConfigs.profiles.main.positions.base, 1200)
    .easing(TWEEN.Easing.Quintic.InOut);
const newTweenDirectionsLow = new TWEEN.Tween(currAnimConfig.directions)
    .to(animConfigs.profiles.low.directions.transition, 150)
    .easing(TWEEN.Easing.Sinusoidal.In);
const newTweenDirectionsLow2 = new TWEEN.Tween(currAnimConfig.directions)
    .to(animConfigs.profiles.low.directions.base, 150)
    .easing(TWEEN.Easing.Sinusoidal.Out);
newTweenDirectionsLow.chain(newTweenDirectionsLow2);
const newTweenDirectionsMain = new TWEEN.Tween(currAnimConfig.directions)
    .to(animConfigs.profiles.main.directions.transition, 600)
    .easing(TWEEN.Easing.Sinusoidal.In);
const newTweenDirectionsMain2 = new TWEEN.Tween(currAnimConfig.directions)
    .to(animConfigs.profiles.main.directions.base, 1200)
    .easing(TWEEN.Easing.Sinusoidal.Out);
newTweenDirectionsMain.chain(newTweenDirectionsMain2);

function init() {

    // Get URL parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get config from query
    if (urlParams.has('config')) {
        currentConfig = config[urlParams.get('config')]
    }

    // Initialize OBS client if we have values
    // This is asyncronous and will set up in the background
    if (urlParams.has('obs_password')) {
        let address = 'localhost:4444';
        if (urlParams.has('obs_address')) {
            address = urlParams.get('obs_address');
        }
        let password = urlParams.get('obs_password');
        initOBS(address, password);
    }

    // Initialize pumper
    Pumper.start('mic', 1160, 14000, 12);
    Pumper.globalSpikeTolerance = 14;

    //Create logo
    logo = new Logo("CONSOLETATION", 7, currentConfig.typeFace)
    logo.createBands(); // Pumper bands

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor.apply(null, currentConfig.bgColor);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.x = currAnimConfig.positions.camera.x;
    camera.position.y = currAnimConfig.positions.camera.y;
    camera.position.z = currAnimConfig.positions.camera.z;
    // Get base camera direction
    camera.getWorldDirection(baseCameraDirection);
    cameraDirection.copy(baseCameraDirection);
    cameraDirection.x += currAnimConfig.directions.camera.x;
    cameraDirection.y += currAnimConfig.directions.camera.y;
    cameraDirection.z += currAnimConfig.directions.camera.z;
    // Calculate camera position
    cameraDirection.add(camera.position);
    camera.lookAt(cameraDirection);

    //Create scene
    scene = new THREE.Scene();

    logo.createMeshs(); // Initialize logo meshs
    initLogoImage();    // Initialize logo image
    initHeading();      // Initialize subheadings

    //Bring the lights
    scene.add(new THREE.AmbientLight(0xcacaca));

    initPostProcessing();

    window.addEventListener('resize', onWindowResize, false);

    frame();
}

async function initOBS(address, password) {
    return obsClient.connect({ address: address, password: password }).then(
        () => {
            console.log(`OBS Client Connected!`);

            // Get current scene
            obsClient.send('GetCurrentScene').then(
                (data) => {
                    // set mainView if 'Title'
                    mainView = data.name.startsWith('Title');
                    console.log(`Current scene is ${data.name}, mainView is ${mainView}`);
                }
            );

            // Handle transitions to/from Title scene
            console.log(`Subscribing to 'TransitionBegin' events for mainView`);
            obsClient.on('TransitionBegin', function callback(data) {
                mainView = data.toScene.startsWith('Title');
            })

            // Handle Title text sources
            console.log(`Subscribing to Headings sources changes for headings`);
            obsClient.on('SceneItemVisibilityChanged', function callback(data) {
                // Ignore events not on 'Flegs' scene
                if (data.sceneName != 'Flegs') return;
                if (data.itemName.startsWith('Heading')) {
                    let heading = data.itemName.charAt(data.itemName.length-1) - 1;
                    console.log(`Setting heading text to: ${headings[heading]}`);
                    headingsContainer.remove(headingsMesh[currentHeading]);
                    currentHeading = heading;
                    headingsContainer.add(headingsMesh[currentHeading]);
                }
            })
        }
    ).catch(
        err => {
            console.log(err);
            console.log("Failed to connect to OBS :(");
        }
    );
}

// Big logo code
class Logo {
    constructor(text, splitPoint, typeFace) {
        this.fulltext = text;
        this.splitPoint = splitPoint;
        this.text = [
            this.fulltext.slice(0, this.splitPoint),
            this.fulltext.slice(this.splitPoint, this.fulltext.length)
        ];
        this.font = [
            '600 160px ' + typeFace,
            '300 160px ' + typeFace
        ];
        this.sections = [
            {
                text: this.text[0],
                font: this.font[0],
                bands: {}
            },
            {
                text: this.text[1],
                font: this.font[1],
                bands: {}
            }
        ];
        this.bands = {};
    }

    createBands() {
        this.bands.low = Pumper.createBands(80, 220, this.fulltext.length, 0.3, 0.39, 1.5);
        this.bands.mid = Pumper.createBands(1000, 2800, this.fulltext.length, 0.5, 0.77, 1.1);
        this.bands.high = Pumper.createBands(2440, 10400, this.fulltext.length, 0.6, 0.9, 1.5);

        this.sections[0].bands.low = this.bands.low.slice(0, this.splitPoint);
        this.sections[1].bands.low = this.bands.low.slice(this.splitPoint, this.fulltext.length);
        this.sections[0].bands.mid = this.bands.mid.slice(0, this.splitPoint);
        this.sections[1].bands.mid = this.bands.mid.slice(this.splitPoint, this.fulltext.length);
        this.sections[0].bands.high = this.bands.high.slice(0, this.splitPoint);
        this.sections[1].bands.high = this.bands.high.slice(this.splitPoint, this.fulltext.length);
    }

    createMeshs() {
        this.sections.forEach(function(section) {
            let logoTextLayerContainer = new THREE.Object3D();
            scene.add(logoTextLayerContainer);

            let slices1 = [];
            let slices2 = [];
            let slices3 = [];
            let slices4 = [];
            let charArray = [];

            for (let i = 0; i < section.text.length; i++) {
                let bitmap = document.createElement('canvas');
                let g = bitmap.getContext('2d');
                bitmap.width = 1024;
                bitmap.height = 200;

                g.font = section.font;
                g.fillStyle = 'white';
                let currWidth = g.measureText(section.text.slice(0, i+1)).width;
                g.font = section.font;
                g.fillStyle = 'white';
                let prevWidth = g.measureText(section.text.slice(0, i)).width;

                bitmap.width = currWidth - prevWidth;

                // I'll never understand this
                if (section.text.charAt(i) == 'A') {
                    bitmap.width += 12.5;
                    currWidth -= 25;
                }
                if (section.text.charAt(i-1) == 'A') {
                    bitmap.width += 12.5;
                    prevWidth -= 25;
                }

                g.font = section.font;
                g.fillStyle = 'white';
                g.fillText(section.text.charAt(i), 0, 160);

                charArray.push({
                    bitmap: bitmap,
                    prevWidth: prevWidth,
                    currWidth: currWidth,
                });
            };
            for (let i = 0; i < charArray.length; i++) {
                let bitmap = charArray[i].bitmap;
                let prevWidth = charArray[i].prevWidth;
                let currWidth = charArray[i].currWidth;
                let texture = new THREE.Texture(bitmap);
                texture.needsUpdate = true;
                texture.minFilter = THREE.LinearFilter;

                let material = new THREE.MeshBasicMaterial({
                    map: texture,
                    color: currentConfig.textColor,
                    transparent: true,
                    opacity: 0.0,
                    side: THREE.DoubleSide,
                    polygonOffset: true,
                    polygonOffsetUnits: -1,
                    polygonOffsetFactor: 0
                });

                let posX = -charArray[charArray.length - 1].currWidth/2;
                posX -= charArray[0].bitmap.width/2;
                posX += prevWidth;
                posX += (currWidth-prevWidth)/2;
                let posY = 0;

                let logoTextLayerMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(bitmap.width, 200), material);
                logoTextLayerMesh.material.opacity = 0.6;
                logoTextLayerMesh.position.set(posX, posY, 0);
                logoTextLayerMesh.material.polygonOffsetFactor = -1;
                logoTextLayerContainer.add(logoTextLayerMesh);
                slices1.push(logoTextLayerMesh);

                let logoTextLayerMesh2 = logoTextLayerMesh.clone();
                logoTextLayerMesh2.material = material.clone();
                logoTextLayerMesh2.position.set(posX, posY, 0);
                logoTextLayerMesh2.material.polygonOffsetFactor = -2;
                logoTextLayerMesh2.material.opacity = 0.05;
                logoTextLayerContainer.add(logoTextLayerMesh2);
                slices2.push(logoTextLayerMesh2);

                let logoTextLayerMesh3 = logoTextLayerMesh.clone();
                logoTextLayerMesh3.material = material.clone();
                logoTextLayerMesh3.position.set(posX, posY, 0);
                logoTextLayerMesh3.material.polygonOffsetFactor = -3;
                logoTextLayerMesh3.material.opacity = 0.05;
                logoTextLayerContainer.add(logoTextLayerMesh3);
                slices3.push(logoTextLayerMesh3);

                let logoTextLayerMesh4 = logoTextLayerMesh.clone();
                logoTextLayerMesh4.material = material.clone();
                logoTextLayerMesh4.position.set(posX, posY, 0);
                logoTextLayerMesh4.material.polygonOffsetFactor = -4;
                logoTextLayerMesh4.material.opacity = 0.1;
                logoTextLayerContainer.add(logoTextLayerMesh4);
                slices4.push(logoTextLayerMesh4);
            };

            section.mesh = {
                container: logoTextLayerContainer,
                width: charArray[charArray.length - 1].currWidth,
                slices: [slices1, slices2, slices3, slices4]
            };
        });
        // Position calculation
        let totalWidth = this.sections[0].mesh.width + this.sections[1].mesh.width;
        this.sections[0].mesh.container.position.x -= (totalWidth - this.sections[0].mesh.width)/2;
        this.sections[1].mesh.container.position.x += (totalWidth - this.sections[1].mesh.width)/2;
    }

    meshUpdate() {
        this.sections.forEach(function(section) {
            for (let letter = 0; letter < section.text.length; letter++) {
                // Band volumes
                let lowVolume = section.bands.low[letter].volume;
                let midVolume = section.bands.mid[letter].volume;
                let highVolume = section.bands.high[letter].volume;

                for (let slice = 0; slice < section.mesh.slices.length; slice++) {
                    // Base positions
                    section.mesh.slices[slice][letter].position.y = currAnimConfig.positions.logo.y[slice];
                    section.mesh.slices[slice][letter].position.z = currAnimConfig.positions.logo.z[slice];
                    // high work
                    section.mesh.slices[slice][letter].position.y += highVolume * currAnimConfig.multipliers.logo.high.y[slice];
                    section.mesh.slices[slice][letter].position.z += highVolume * currAnimConfig.multipliers.logo.high.z[slice];
                    // mid work
                    section.mesh.slices[slice][letter].position.y += midVolume * currAnimConfig.multipliers.logo.mid.y[slice];
                    section.mesh.slices[slice][letter].position.z += midVolume * currAnimConfig.multipliers.logo.mid.z[slice];
                    //low work
                    section.mesh.slices[slice][letter].position.y += lowVolume * currAnimConfig.multipliers.logo.low.y[slice];
                    section.mesh.slices[slice][letter].position.z += lowVolume * currAnimConfig.multipliers.logo.low.z[slice];
                    //global work
                    section.mesh.slices[slice][letter].position.y += Pumper.volume * currAnimConfig.multipliers.logo.global.y[slice];
                    section.mesh.slices[slice][letter].position.z += Pumper.volume * currAnimConfig.multipliers.logo.global.z[slice];
                }
            }
        });
    };
};

function initLogoImage(){
    const basePath = '../../assets/';
    let texture = new THREE.TextureLoader().load(basePath + currentConfig.logoImage);
    let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthFunc: THREE.AlwaysDepth});
    let geometry = new THREE.PlaneGeometry(currentConfig.logoImageSize, currentConfig.logoImageSize);

    logoImageMesh = new THREE.Mesh( geometry, material );
    // TODO: Set initial position
    //logoImageMesh.position.x = 557;  // y is determined in update()

    scene.add(logoImageMesh);
}

function initHeading(){
    headingsContainer = new THREE.Object3D();
    headingsContainer.position.x = window.innerWidth * 0.5;
    headingsContainer.position.y = -1100;
    scene.add(headingsContainer);

    var headingMesh, bitmap, g, texture, material, geometry;
    for (var heading = 0; heading < headings.length; heading++){
        bitmap = document.createElement('canvas');
        g = bitmap.getContext('2d');
        g.font = 'normal 48px ' + currentConfig.typeFace;
        bitmap.width = g.measureText(headings[heading]).width;
        bitmap.height = 200;
        g.font = 'normal 48px ' + currentConfig.typeFace;
        g.fillStyle = 'white';
        g.fillText(headings[heading], 0, 160);

        texture = new THREE.Texture(bitmap);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        material = new THREE.MeshBasicMaterial({
            map: texture, color: currentConfig.textColor, transparent: true, opacity: 1
        });
        geometry = new THREE.PlaneBufferGeometry(bitmap.width, bitmap.height);
        headingMesh = new THREE.Mesh(geometry, material);
        headingMesh.position.x = window.innerWidth * -0.5;
        headingMesh.position.y = window.innerHeight * 0.5;

        headingsMesh.push(headingMesh);
    }
    headingsContainer.add(headingsMesh[currentHeading]);
}

function initPostProcessing(){
    // postprocessing
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    var testPass = new ShaderPass(TestShader);
    testPass.uniforms[ "amount" ].value = 0.95;
    composer.addPass(testPass);

    glitchPass = new GlitchPass();
    composer.addPass( glitchPass );

    var shaderVignette = VignetteShader;
    var effectVignette = new ShaderPass(shaderVignette);
    effectVignette.uniforms.offset.value = currentConfig.vignette.offset;
    effectVignette.uniforms.darkness.value = currentConfig.vignette.darkness;
    composer.addPass(effectVignette);

    var effectFilmPass = new FilmPass(...currentConfig.filmGrain);
    effectFilmPass.renderToScreen = true;
    composer.addPass(effectFilmPass);
}

function update() {
    Pumper.update();
    TWEEN.update();

    // Handle animation config change
    if (mainView !== mainViewUpdate) {
        mainViewUpdate = mainView;
        if (mainViewUpdate) {
            console.log('Tweening to main');
            newTweenMultipliersMain.start();
            newTweenPositionsMain.start();
            newTweenDirectionsMain.start();
        } else {
            console.log('Tweening to low');
            newTweenMultipliersLow.start();
            newTweenPositionsLow.start();
            newTweenDirectionsLow.start();
        }
    }

    //Animate logo.fulltext layers based on bands
    logo.meshUpdate();

    // Animate image mesh with last letter
    logoImageMesh.position.x = logo.sections[1].mesh.slices[0][logo.sections[1].text.length - 1].position.x;
    logoImageMesh.position.y = logo.sections[1].mesh.slices[0][logo.sections[1].text.length - 1].position.y;
    logoImageMesh.position.z = logo.sections[1].mesh.slices[0][logo.sections[1].text.length - 1].position.z;
    // Position correction
    logoImageMesh.position.x += 342;
    logoImageMesh.position.y -= 175;

    // Headings container position
    headingsContainer.position.y = currAnimConfig.positions.headings.y;
    headingsContainer.position.z = currAnimConfig.positions.headings.z;
    headingsContainer.position.y += Pumper.volume * currAnimConfig.multipliers.headings.global.y;
    headingsContainer.position.z += Pumper.volume * currAnimConfig.multipliers.headings.global.z;

    // Calculate camera direction
    cameraDirection.copy(baseCameraDirection);
    cameraDirection.x += currAnimConfig.directions.camera.x;
    cameraDirection.y += currAnimConfig.directions.camera.y;
    cameraDirection.z += currAnimConfig.directions.camera.z;
    // Calculate camera position
    cameraDirection.add(camera.position);
    camera.lookAt(cameraDirection);

    // Base camera positions
    camera.position.x = currAnimConfig.positions.camera.x;
    camera.position.y = currAnimConfig.positions.camera.y;
    camera.position.z = currAnimConfig.positions.camera.z;
    camera.position.y += Pumper.volume * currAnimConfig.multipliers.camera.global.y;
    camera.position.z += Pumper.volume * currAnimConfig.multipliers.camera.global.z;

    // Extra illegal X-axis sizzle
    camera.position.x += logo.bands.high[6].volume * currAnimConfig.multipliers.camera.global.x;
    camera.position.x -= logo.bands.high[7].volume * currAnimConfig.multipliers.camera.global.x;
}

function frame() {
    requestAnimationFrame(frame);
    update();
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function click() {
    //Pumper.play();  // if needed
    glitchPass.goWild = true;
    setTimeout(function (){
        glitchPass.goWild = false;
    }, 100)
    headingsContainer.remove(headingsMesh[currentHeading]);
    currentHeading++;
    if (currentHeading > headings.length - 1) {currentHeading = 0;}
    headingsContainer.add(headingsMesh[currentHeading]);
}

var BeatProcessing = {
    init: init
}

export default BeatProcessing;
