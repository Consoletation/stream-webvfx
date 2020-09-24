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

import AnimationConfig from './AnimationConfig.js';
import Logo from './Logo.js';

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
        logoImagePosCorr: { x: -48, y: -175 },
        animationProfiles: ['main', 'low'],
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
        logoImagePosCorr: { x: -48, y: -175 },
        animationProfiles: ['main', 'low'],
        vignette: {
            offset: 0.5,
            darkness: 1.6,
        },
        filmGrain: [0.12, 0.125, 648, false]
    },
    transparentNew: {
        bgColor: [0x000000, 0],
        textColor: 0xffffff,
        typeFace: 'video',
        logoImage: 'controller-up-white.png',
        logoImageSize: 198,
        logoImagePosCorr: { x: -51, y: -159 },
        animationProfiles: ['main', 'lowsplit'],
        vignette: {
            offset: 0.0,
            darkness: 0.0,
        },
        filmGrain: [0, 0, 648, false]
    },
    classicNew: {
        bgColor: [0xffffff, 1],
        textColor: 0x000000,
        typeFace: 'video',
        logoImage: 'controller-up.png',
        logoImageSize: 198,
        logoImagePosCorr: { x: -51, y: -159 },
        animationProfiles: ['main', 'lowsplit'],
        vignette: {
            offset: 0.5,
            darkness: 1.6,
        },
        filmGrain: [0.12, 0.125, 648, false]
    },
};

// Globals updated via init()
let camera, renderer, composer, glitchPass;
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
let animConfig;

function init() {

    // Get URL parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get config from query
    if (urlParams.has('config')) {
        currentConfig = config[urlParams.get('config')]
    }

    // Set up animation config
    animConfig = new AnimationConfig(currentConfig.animationProfiles[0]);

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
    logo = new Logo("CONSOLETATION", 7, currentConfig.typeFace, currentConfig.textColor)
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

    logo.createMeshs(scene); // Initialize logo meshs
    initLogoImage(scene);    // Initialize logo image
    initHeading(scene);      // Initialize subheadings

    //Bring the lights
    scene.add(new THREE.AmbientLight(0xcacaca));

    initPostProcessing(scene);

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

function initLogoImage(scene){
    const basePath = '../../assets/';
    let texture = new THREE.TextureLoader().load(basePath + currentConfig.logoImage);
    let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthFunc: THREE.AlwaysDepth});
    let geometry = new THREE.PlaneGeometry(currentConfig.logoImageSize, currentConfig.logoImageSize);

    logoImageMesh = new THREE.Mesh( geometry, material );
    // TODO: Set initial position
    //logoImageMesh.position.x = 557;  // y is determined in update()

    scene.add(logoImageMesh);
}

function initHeading(scene){
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

function initPostProcessing(scene){
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
            animConfig.transition(currentConfig.animationProfiles[0]);
        } else {
            console.log('Tweening to sub');
            animConfig.transition(currentConfig.animationProfiles[1]);
        }
    }

    //Animate logo.fulltext layers based on bands
    logo.meshUpdate(animConfig);

    // Animate image mesh with a section and a letter
    let tS = Math.round(animConfig.positions.image.tracker[0]);
    let tL = Math.round(animConfig.positions.image.tracker[1]);
    logoImageMesh.position.x = logo.sections[tS].mesh.container.position.x;
    logoImageMesh.position.y = logo.sections[tS].mesh.container.position.y;
    logoImageMesh.position.z = logo.sections[tS].mesh.container.position.z;
    logoImageMesh.position.x += logo.sections[tS].mesh.slices[0][tL].position.x;
    logoImageMesh.position.y += logo.sections[tS].mesh.slices[0][tL].position.y;
    logoImageMesh.position.z += logo.sections[tS].mesh.slices[0][tL].position.z;
    // Position correction from config
    logoImageMesh.position.x += currentConfig.logoImagePosCorr.x;
    logoImageMesh.position.y += currentConfig.logoImagePosCorr.y;
    // Position correction from animation config
    logoImageMesh.position.x += animConfig.positions.image.x;
    logoImageMesh.position.y += animConfig.positions.image.y;

    // Headings container position
    headingsContainer.position.y = animConfig.positions.headings.y;
    headingsContainer.position.z = animConfig.positions.headings.z;
    headingsContainer.position.y += Pumper.volume * animConfig.multipliers.headings.global.y;
    headingsContainer.position.z += Pumper.volume * animConfig.multipliers.headings.global.z;

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
    camera.position.y += Pumper.volume * animConfig.multipliers.camera.global.y;
    camera.position.z += Pumper.volume * animConfig.multipliers.camera.global.z;

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
