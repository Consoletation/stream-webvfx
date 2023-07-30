import 'core-js/features/math/clamp';
import * as THREE from 'three';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { TestShader } from '../../libs/three/shaders/TestShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from '../../libs/three/postprocessing/GlitchPassCustom.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

import { Pumper } from 'pumper';
import OBSWebSocket from 'obs-websocket-js';
import TWEEN from '@tweenjs/tween.js';

import AnimationConfig from './AnimationConfig.js';
import Logo from './Logo.js';

// Static globals
const obsClient = new OBSWebSocket(); // OBS client
const headingsMesh = [];
const headings = ['Starting soon...', 'Taking a quick break!', 'Thanks for watching!'];
const imagesMesh = [];
const config = {
    transparent: {
        bgColor: [0x000000, 0],
        textColor: 0xffffff,
        opacityFactor: 1,
        typeFace: 'rigid-square',
        logoImages: ['controller-white.png'],
        logoImageSize: 256,
        logoImagePosCorr: [{ x: -48, y: -175 }],
        animationProfiles: { title: 'main', corner: 'low', alert: 'low' },
        vignette: {
            offset: 0.0,
            darkness: 0.0,
        },
        filmGrain: [0, 0, 648, false],
    },
    classic: {
        bgColor: [0xffffff, 1],
        textColor: 0x000000,
        opacityFactor: 0.8,
        typeFace: 'rigid-square',
        logoImages: ['controller.png'],
        logoImageSize: 256,
        logoImagePosCorr: [{ x: -48, y: -175 }],
        animationProfiles: { title: 'main', corner: 'low', alert: 'low' },
        vignette: {
            offset: 0.5,
            darkness: 1.6,
        },
        filmGrain: [0.12, 0.125, 648, false],
    },
    transparentNew: {
        bgColor: [0x000000, 0],
        textColor: 0xffffff,
        opacityFactor: 1,
        typeFace: 'video',
        logoImages: ['controller-up-white2.json', 'controller-right-white4.json'],
        logoImageSize: 198,
        logoImagePosCorr: [{ x: -33, y: -120 }, { x: -33, y: -80 }],
        animationProfiles: { title: 'main', corner: 'lowsplit', alert: 'alert' },
        vignette: {
            offset: 0.0,
            darkness: 0.0,
        },
        filmGrain: [0, 0, 648, false],
    },
    classicNew: {
        bgColor: [0xffffff, 1],
        textColor: 0x000000,
        opacityFactor: 0.8,
        typeFace: 'video',
        logoImages: ['controller-up.png', 'controller-right.png'],
        logoImageSize: 198,
        logoImagePosCorr: [{ x: -51, y: -159 }, { x: -51, y: -159 }],
        animationProfiles: { title: 'main', corner: 'lowsplit', alert: 'alert' },
        vignette: {
            offset: 0.5,
            darkness: 1.6,
        },
        filmGrain: [0.12, 0.125, 648, false],
    },
};

// Globals updated via init()
let pumper;
let camera, renderer, composer, glitchPass;
let baseCameraDirection = new THREE.Vector3();
let currentConfig = config.transparent; // Default config
// Globals updated via init() or update()
let cameraDirection = new THREE.Vector3();
let logo;
let headingsContainer; // Updated by click() or OBS events
let imageContainer;
let currentHeading = 0;
let currentImage = 0;
let newProfile = 'title';
let currentProfile = 'title';
let animConfig;
let currentFrame = 0;

function init() {
    // Get URL parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get config from query
    if (urlParams.has('config')) {
        currentConfig = config[urlParams.get('config')];
    }

    // Set up animation config
    animConfig = new AnimationConfig(currentConfig.animationProfiles[currentProfile]);

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

    // Initialize pumper and logo
    pumper = new Pumper();
    logo = new Logo(
        'CONSOLETATION',
        7,
        currentConfig.typeFace,
        currentConfig.textColor,
        currentConfig.opacityFactor * 0.6,
    );

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor.apply(null, currentConfig.bgColor);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.x = animConfig.positions.camera.x;
    camera.position.y = animConfig.positions.camera.y;
    camera.position.z = animConfig.positions.camera.z;
    // Get base camera direction
    camera.getWorldDirection(baseCameraDirection);
    cameraDirection.copy(baseCameraDirection);
    cameraDirection.x += animConfig.directions.camera.x;
    cameraDirection.y += animConfig.directions.camera.y;
    cameraDirection.z += animConfig.directions.camera.z;
    // Calculate camera position
    cameraDirection.add(camera.position);
    camera.lookAt(cameraDirection);

    //Create scene
    const scene = new THREE.Scene();

    pumper
        .start('mic', 1160, 14000, 12)
        .then(() => {
            pumper.globalSpikeTolerance = 14;
            logo.createBands(pumper); // Pumper bands
            logo.createMeshs(scene); // Initialize logo meshs
            initLogoImage(scene); // Initialize logo image
            initHeading(scene); // Initialize subheadings

            initPostProcessing(scene);

            window.addEventListener('resize', onWindowResize, false);

            frame();
        })
        .catch(err => {
            console.error(err);
        });
}

function sceneAnimProfile(sceneName) {
    if (sceneName.startsWith('Title')) return 'title';
    if (sceneName.includes('Alert')) return 'alert';
    return 'corner';
}

async function initOBS(address, password) {
    return obsClient
        .connect({ address: address, password: password })
        .then(() => {
            console.log(`OBS Client Connected!`);

            // Get current scene
            obsClient.send('GetCurrentScene').then(data => {
                // set animProfile from scene
                newProfile = sceneAnimProfile(data.name);
                console.log(`Current scene is ${data.name}, newProfile is ${newProfile}`);
            });

            // Handle transitions to/from scenes
            console.log(`Subscribing to 'TransitionBegin' events for newProfile`);
            obsClient.on('TransitionBegin', function callback(data) {
                newProfile = sceneAnimProfile(data.toScene);
            });

            // Handle Title text sources
            console.log(`Subscribing to Headings sources changes for headings`);
            obsClient.on('SceneItemVisibilityChanged', function callback(data) {
                // Ignore events not on 'Flegs' scene
                if (data.sceneName != 'Flegs') return;
                if (data.itemName.startsWith('Heading')) {
                    let heading = data.itemName.charAt(data.itemName.length - 1) - 1;
                    console.log(`Setting heading text to: ${headings[heading]}`);
                    headingsContainer.remove(headingsMesh[currentHeading]);
                    currentHeading = heading;
                    headingsContainer.add(headingsMesh[currentHeading]);

                    // Do some glitch effect
                    glitchPass.goWild = true;
                    setTimeout(function () {
                        glitchPass.goWild = false;
                    }, 100);
                }
            });
        })
        .catch(err => {
            console.log(err);
            console.log('Failed to connect to OBS :(');
        });
}

function initLogoImage(scene) {
    imageContainer = new THREE.Object3D();
    scene.add(imageContainer);
    window.imageContainer = imageContainer;

    const basePath = '../../assets/';
    const fileLoader = new THREE.FileLoader();
    const textureLoader = new THREE.TextureLoader();
    for (let i = 0; i < currentConfig.logoImages.length; i++) {
        const file = basePath + currentConfig.logoImages[i];
        let texture;
        if (file.endsWith('.json')) {
            fileLoader.load(file, function (json) {
                const data = JSON.parse(json);
                texture = textureLoader.load(file.replace('.json', '.png'));
                console.log('anim texture', texture);
                sheetLoader(texture, data);
                console.log('anim texture update', texture);
                createMaterialAndMesh(texture);
            });
        } else {
            texture = textureLoader.load(file);
            console.log('norm texture', texture);
            createMaterialAndMesh(texture);
        }
    }
    imageContainer.add(imagesMesh[currentImage]);
}

function createMaterialAndMesh(texture) {
    console.log('texture pre material', texture);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: currentConfig.opacityFactor * 0.8,
        side: THREE.DoubleSide,
        depthFunc: THREE.AlwaysDepth,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: 1,
    });
    console.log('new material', material);
    const geometry = new THREE.PlaneGeometry(currentConfig.logoImageSize, currentConfig.logoImageSize);

    const logoImageMesh = new THREE.Mesh(geometry, material);
    imagesMesh.push(logoImageMesh);
}

function initHeading(scene) {
    headingsContainer = new THREE.Object3D();
    headingsContainer.position.x = window.innerWidth * 0.5;
    headingsContainer.position.y = -1100;
    scene.add(headingsContainer);

    var headingMesh, bitmap, g, texture, material, geometry;
    for (var heading = 0; heading < headings.length; heading++) {
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
            map: texture,
            color: currentConfig.textColor,
            transparent: true,
            opacity: currentConfig.opacityFactor,
        });
        geometry = new THREE.PlaneGeometry(bitmap.width, bitmap.height);
        headingMesh = new THREE.Mesh(geometry, material);
        headingMesh.position.x = window.innerWidth * -0.5;
        headingMesh.position.y = window.innerHeight * 0.5;

        headingsMesh.push(headingMesh);
    }
    headingsContainer.add(headingsMesh[currentHeading]);
}

function initPostProcessing(scene) {
    // postprocessing
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    var testPass = new ShaderPass(TestShader);
    testPass.uniforms['amount'].value = 0.95;
    composer.addPass(testPass);

    glitchPass = new GlitchPass();
    console.log('glitchPass', glitchPass);
    composer.addPass(glitchPass);

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
    pumper.update();
    TWEEN.update();

    if (window.currentConfig !== currentConfig) {
        window.currentConfig = currentConfig;
    }

    // Handle animation config change
    if (newProfile !== currentProfile) {
        currentProfile = newProfile;
        let name = currentConfig.animationProfiles[currentProfile];
        console.log(`Tweening to ${name}`);
        animConfig.transition(name);
    }

    //Animate logo.fulltext layers based on bands
    logo.meshUpdate(animConfig, pumper);

    // Check if we should change image
    let iC = animConfig.references.image.current;
    if (iC != currentImage && iC < imagesMesh.length) {
        imageContainer.remove(imagesMesh[currentImage]);
        currentImage = iC;
        imageContainer.add(imagesMesh[currentImage]);
    }

    // Update image frame if needed
    const currentTexture = imagesMesh[currentImage].material.map;
    if (currentTexture.frames) {
        const newFrame = Math.clamp(0, Math.round(animConfig.references.image.frame), currentTexture.frames.length - 1);
        if (currentFrame !== newFrame) {
            currentFrame = newFrame;
            const newFrameData = currentTexture.frames[newFrame];
            currentTexture.offset = newFrameData.offset;
            currentTexture.repeat = newFrameData.repeat;
            // console.log('new frame', newFrame, currentTexture.offset, currentTexture.repeat);
            // window.testTexture = currentTexture;

        }
    }

    // Animate image mesh with a section and a letter
    let tS = animConfig.references.image.tracker[0];
    let tL = animConfig.references.image.tracker[1];
    imageContainer.position.x = logo.sections[tS].mesh.container.position.x;
    imageContainer.position.y = logo.sections[tS].mesh.container.position.y;
    imageContainer.position.z = logo.sections[tS].mesh.container.position.z;
    imageContainer.position.x += logo.sections[tS].mesh.slices[0][tL].position.x;
    imageContainer.position.y += logo.sections[tS].mesh.slices[0][tL].position.y;
    imageContainer.position.z += logo.sections[tS].mesh.slices[0][tL].position.z;
    // Position correction from config
    imageContainer.position.x += currentConfig.logoImagePosCorr[currentImage].x;
    imageContainer.position.y += currentConfig.logoImagePosCorr[currentImage].y;
    // Position correction from animation config
    imageContainer.position.x += animConfig.positions.image.x;
    imageContainer.position.y += animConfig.positions.image.y;
    // Rotation from animation config
    imageContainer.rotation.z = animConfig.positions.image.rotate;

    // Headings container position
    headingsContainer.position.y = animConfig.positions.headings.y;
    headingsContainer.position.z = animConfig.positions.headings.z;
    headingsContainer.position.y += pumper.volume * animConfig.multipliers.headings.global.y;
    headingsContainer.position.z += pumper.volume * animConfig.multipliers.headings.global.z;

    // Calculate camera direction
    cameraDirection.copy(baseCameraDirection);
    cameraDirection.x += animConfig.directions.camera.x;
    cameraDirection.y += animConfig.directions.camera.y;
    cameraDirection.z += animConfig.directions.camera.z;
    // Calculate camera position
    cameraDirection.add(camera.position);
    camera.lookAt(cameraDirection);

    // Base camera positions
    camera.position.x = animConfig.positions.camera.x;
    camera.position.y = animConfig.positions.camera.y;
    camera.position.z = animConfig.positions.camera.z;
    camera.position.y += pumper.volume * animConfig.multipliers.camera.global.y;
    camera.position.z += pumper.volume * animConfig.multipliers.camera.global.z;

    // Extra illegal X-axis sizzle
    camera.position.x += logo.bands.high[6].volume * animConfig.multipliers.camera.global.x;
    camera.position.x -= logo.bands.high[7].volume * animConfig.multipliers.camera.global.x;
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
    //pumper.play();  // if needed
    glitchPass.goWild = true;
    setTimeout(function () {
        glitchPass.goWild = false;
    }, 100);
    headingsContainer.remove(headingsMesh[currentHeading]);
    currentHeading++;
    if (currentHeading > headings.length - 1) {
        currentHeading = 0;
    }
    headingsContainer.add(headingsMesh[currentHeading]);
}

/**
 * Load spritesheet and create a texture atlas
 * @param {THREE.Texture} texture
 * @param {data} data
 */
function sheetLoader(texture, data) {
    const frames = [];
    const width = data.meta.size.w;
    const height = data.meta.size.h;

    for (let i = 0; i < data.frames.length; i++) {
        if (data.frames[i].rotated) {
            throw('rotated frames not supported');
        }
        const frame = {
            repeat: { x: data.frames[i].frame.w / width, y: data.frames[i].frame.h / height },
            offset: { x: data.frames[i].frame.x / width, y: 1 - ((data.frames[i].frame.y + data.frames[i].sourceSize.h) / height) },
            //x: data.frames[i].frame.x,
            //y: data.frames[i].frame.y,
        };
        frames.push(frame);
    }
    // Store frame data in texture
    texture.frames = frames;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // Set offset once
    console.log(`Setting texture repeat to ${texture.frames[0].repeat}`);
    texture.repeat = texture.frames[0].repeat;
    // Update texture to first frame
    console.log(`Setting texture offset to ${texture.frames[0].offset}`);
    texture.offset = texture.frames[0].offset;
    // Set onUpdate callback
    // texture.onUpdate = function (self) {
    //     console.log(`Updating texture`);
    //     const newFrame = Math.clamp(currentFrame, 0, self.frames.length - 1);
    //     if (self.frames[newFrame].offset === self.offset) return;
    //     console.log(`Updating texture to frame ${newFrame}`);
    //     self.offset = self.frames[newFrame].offset;
    //     self.repeat = self.frames[newFrame].repeat;
    //     //console.log(`Setting texture offset to ${self.frames[newFrame].offset}`);
    //     window.testTexture = self;
    // }
}

var BeatProcessing = {
    init: init,
};

export default BeatProcessing;
