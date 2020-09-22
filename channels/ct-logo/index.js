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

var logoText = 'CONSOLETATION';

var textDivisions = logoText.length;

var camera, scene, renderer, composer, glitchPass;
var baseCameraDirection = new THREE.Vector3;
var cameraDirection = new THREE.Vector3;
var logoTextMesh;
var logoImageMesh;
var headingsContainer;
var headingsMesh = [];
var headings = [
    'Starting soon...',
    'Taking a quick break!',
    'Thanks for watching!'
];
var currentHeading = 0;
let mainView = true;
let mainViewUpdate = true;

// OBS client
const obsClient = new OBSWebSocket();

// Get URL parameters
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var config = {
    'transparent': {
        'bgColor': [0x000000, 0],
        'textColor': 0xffffff,
        'contLogo': '../../assets/controller-white.png',
        'vignette': {
            'offset': 0.0,
            'darkness': 0.0,
        },
        'filmGrain': [0, 0, 648, false]
    },
    'classic': {
        'bgColor': [0xffffff, 1],
        'textColor': 0x000000,
        'contLogo': '../../assets/controller.png',
        'vignette': {
            'offset': 0.5,
            'darkness': 1.6,
        },
        'filmGrain': [0.12, 0.125, 648, false]
    }
};
var currentConfig = config.transparent; // Default config

const animConfigs = {
    main: {
        logo: {
            base: { y: [0, 8, 0, 0], z: [0, 0, 0, 0] },
            highM: { y: [1, 0.1, 1.95, 1.5], z: [0, 0, 0, 0] },
            midM: { y: [0.5, 0.1, 0.8, 0.4], z: [0, 0, 0, 0] },
            lowM: { y: [0, 0, 0, 0], z: [1, 1, 1, 1] },
            globM: { y: [0, 0, 0, 0], z: [0.5, 0.5, 0.5, 0.5] },
        },
        headings: {
            base: { y: -900, z: 0 },
            globM: { y: 0.3, z: 0 },
        },
        camera: {
            base: { x: -43, y: -90, z: 1000 },
            dirB: { x: 0, y: 0, z: 0 },
            dirT: { x: 0.18, y: 0, z: 0 },
            globM: { x: 1, y: 0.3, z: 0.09 },
        },
    },
    low: {
        logo: {
            base: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            highM: { y: [0.6, 0.6, 0.6, 0.6], z: [0, 0, 0, 0] },
            midM: { y: [0.2, 0.2, 0.2, 0.2], z: [0, 0, 0, 0] },
            lowM: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
            globM: { y: [0, 0, 0, 0], z: [0, 0, 0, 0] },
        },
        headings: {
            base: { y: -1000, z: 0 },
            globM: { y: 0, z: 0 },
        },
        camera: {
            base: { x: -43, y: 100, z: 720 },
            dirB: { x: 0, y: 0, z: 0 },
            dirT: { x: 0, y: 0, z: 0 },
            globM: { x: 0, y: 0.2, z: 0 },
        },
    },
}

let currAnimConfig = JSON.parse(JSON.stringify(animConfigs.main)); // so gross
var cameraDir = Object.assign({}, currAnimConfig.camera.dirB);
const tweenLow = new TWEEN.Tween(currAnimConfig)
    .to(animConfigs.low, 300)
    .easing(TWEEN.Easing.Quintic.InOut);
const tweenMain = new TWEEN.Tween(currAnimConfig)
    .to(animConfigs.main, 1200)
    .easing(TWEEN.Easing.Quintic.InOut);
const transCamLow = new TWEEN.Tween(cameraDir)
    .to(animConfigs.low.camera.dirT, 150)
    .easing(TWEEN.Easing.Sinusoidal.In);
const transCamLow2 = new TWEEN.Tween(cameraDir)
    .to(animConfigs.low.camera.dirB, 150)
    .easing(TWEEN.Easing.Sinusoidal.Out);
transCamLow.chain(transCamLow2);
const transCamMain = new TWEEN.Tween(cameraDir)
    .to(animConfigs.main.camera.dirT, 600)
    .easing(TWEEN.Easing.Sinusoidal.In);
const transCamMain2 = new TWEEN.Tween(cameraDir)
    .to(animConfigs.main.camera.dirB, 1200)
    .easing(TWEEN.Easing.Sinusoidal.Out);
transCamMain.chain(transCamMain2);

function init() {

    // Get config from query
    if (urlParams.has('config')) {
        currentConfig = config[urlParams.get('config')]
    }

    //Create bands
    Pumper.createBands(80, 220, textDivisions, 0.3, 0.39, 1.5);
    Pumper.createBands(1000, 2800 , textDivisions, 0.5, 0.77, 1.1);
    Pumper.createBands(2440, 10400 , textDivisions, 0.6, 0.9, 1.5);

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor.apply(null, currentConfig.bgColor);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.x = currAnimConfig.camera.base.x;
    camera.position.y = currAnimConfig.camera.base.y;
    camera.position.z = currAnimConfig.camera.base.z;
    // Get base camera direction
    camera.getWorldDirection(baseCameraDirection);
    cameraDirection.copy(baseCameraDirection);
    cameraDirection.x += cameraDir.x;
    cameraDirection.y += cameraDir.y;
    cameraDirection.z += cameraDir.z;
    // Calculate camera position
    cameraDirection.add(camera.position);
    camera.lookAt(cameraDirection);

    //Create scene
    scene = new THREE.Scene();

    // Initialize OBS client if we have values
    if (urlParams.has('obs_password')) {
        let address = 'localhost:4444';
        if (urlParams.has('obs_address')) {
            address = urlParams.get('obs_address');
        }
        let password = urlParams.get('obs_password');
        initOBS(address, password);
    }
    initLogoText();
    initLogoImage();
    initHeading();

    //Bring the lights
    scene.add(new THREE.AmbientLight(0xcacaca));

    initPostProcessing();

    window.addEventListener('resize', onWindowResize, false);

    frame();
}

function initOBS(address, password) {
    obsClient.connect({ address: address, password: password }).then(
        () => {
            console.log(`OBS Client Connected!`);

            // Get current scene
            obsClient.send('GetCurrentScene').then(
                (data) => {
                    // set mainView if 'Title'
                    mainView = data.name.startsWith('Title');
                }
            );

            // Handle transitions to/from Title scene
            obsClient.on('TransitionBegin', function callback(data) {
                mainView = data.toScene.startsWith('Title');
            })

            // Handle Title text sources
            obsClient.on('SceneItemVisibilityChanged', function callback(data) {
                if (data.itemName.startsWith('Heading')) {
                    let heading = data.itemName.charAt(data.itemName.length-1) - 1;
                    console.log("Setting heading text to:", headings[heading]);
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

function initLogoText(){
    //Create shapes container
    var txtWidth, bitmap,
        g,
        texture, material, logoTextLayerContainer,
        logoTextLayerMesh, logoTextLayerMesh2, logoTextLayerMesh3, logoTextLayerMesh4,
        divisionWidth, slices1, slices2, slices3, slices4,
        posX, posY, charOffset = 0;

    //create text image
    // canvas contents will be used for a texture
    logoTextLayerContainer = new THREE.Object3D();
    scene.add(logoTextLayerContainer);

    slices1 = [];
    slices2 = [];
    slices3 = [];
    slices4 = [];
    for (var j = 0 ; j < textDivisions ; j ++){
        //Dirty as fuck, but I've got to create a canvas per logo slice
        //Also, weirdly the width can't seem to be set after adding a text in
        bitmap = document.createElement('canvas');
        g = bitmap.getContext('2d');
        bitmap.width = 1024;
        bitmap.height = 200;
        if (j < 6){
            g.font = '600 160px rigid-square';
        }else{
            g.font = '300 160px rigid-square';
        }
        g.fillStyle = 'white';
        divisionWidth = g.measureText(logoText.charAt(j)).width;
        if (logoText.charAt(j) === 'A'){ divisionWidth = 110;}
        if (logoText.charAt(j) === 'E'){ divisionWidth = 100;}
        if (logoText.charAt(j) === 'I'){ divisionWidth = 90;}
        if (logoText.charAt(j) === 'N'){ divisionWidth = 116;}
        if (logoText.charAt(j) === 'O'){ divisionWidth = 116;}
        if (logoText.charAt(j) === 'S'){ divisionWidth = 112;}

        bitmap.width = divisionWidth;
        if (j < 7){
            g.font = '600 160px rigid-square';
        }else{
            g.font = '300 160px rigid-square';
        }
        g.fillStyle = 'white';
        txtWidth = g.measureText(logoText).width;
        g.fillText(logoText.charAt(j), 0, 160 );

        texture = new THREE.Texture(bitmap);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        material = new THREE.MeshBasicMaterial({
            map : texture, color: currentConfig.textColor, transparent: true, opacity: 0.0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetUnits: -1, polygonOffsetFactor: 0
        });

        posX = charOffset - txtWidth * 0.5;
        posY = 0;
        charOffset += divisionWidth;

        logoTextLayerMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(divisionWidth, 200), material);
        logoTextLayerMesh.material.opacity = 0.6;
        logoTextLayerMesh.position.set(posX, posY, 0);
        logoTextLayerMesh.material.polygonOffsetFactor = -1;
        logoTextLayerContainer.add(logoTextLayerMesh);
        slices1.push(logoTextLayerMesh);

        logoTextLayerMesh2 = logoTextLayerMesh.clone();
        logoTextLayerMesh2.material = material.clone();
        logoTextLayerMesh2.position.set(posX, posY, 0);
        logoTextLayerMesh2.material.polygonOffsetFactor = -2;
        logoTextLayerMesh2.material.opacity = 0.05;
        logoTextLayerContainer.add(logoTextLayerMesh2);
        slices2.push(logoTextLayerMesh2);

        logoTextLayerMesh3 = logoTextLayerMesh.clone();
        logoTextLayerMesh3.material = material.clone();
        logoTextLayerMesh3.position.set(posX, posY, 0);
        logoTextLayerMesh3.material.polygonOffsetFactor = -3;
        logoTextLayerMesh3.material.opacity = 0.05;
        logoTextLayerContainer.add(logoTextLayerMesh3);
        slices3.push(logoTextLayerMesh3);

        logoTextLayerMesh4 = logoTextLayerMesh.clone();
        logoTextLayerMesh4.material = material.clone();
        logoTextLayerMesh4.position.set(posX, posY, 0);
        logoTextLayerMesh4.material.polygonOffsetFactor = -4;
        logoTextLayerMesh4.material.opacity = 0.1;
        logoTextLayerContainer.add(logoTextLayerMesh4);
        slices4.push(logoTextLayerMesh4);
    }
    logoTextMesh = {
        container: logoTextLayerContainer,
        slices: [slices1, slices2, slices3, slices4]
    };
}

function initLogoImage(){
    var texture = new THREE.TextureLoader().load(currentConfig.contLogo);
    var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthFunc: THREE.AlwaysDepth});
    var geometry = new THREE.PlaneGeometry(256, 256);

    logoImageMesh = new THREE.Mesh( geometry, material );
    logoImageMesh.position.x = 557;  // y is determined in update()

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
        g.font = 'normal 48px rigid-square';
        bitmap.width = g.measureText(headings[heading]).width;
        bitmap.height = 200;
        g.font = 'normal 48px rigid-square';
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
            tweenMain.start();
            transCamMain.start();
        } else {
            console.log('Tweening to low');
            tweenLow.start();
            transCamLow.start();
        }
    }

    //Animate logo text layers based on bands
    const low = 0, mid = textDivisions, high = textDivisions*2;
    let lowVolume = 0, midVolume = 0, highVolume = 0, globVolume = Pumper.volume;
    for (let letter = 0; letter < textDivisions; letter++){

        // Band volumes
        lowVolume = Pumper.bands[low+letter].volume;
        midVolume = Pumper.bands[mid+letter].volume;
        highVolume = Pumper.bands[high+letter].volume;

        for (let slice = 0; slice < logoTextMesh.slices.length; slice++) {
            // Base positions
            logoTextMesh.slices[slice][letter].position.y = currAnimConfig.logo.base.y[slice];
            logoTextMesh.slices[slice][letter].position.z = currAnimConfig.logo.base.z[slice];
            // high work
            logoTextMesh.slices[slice][letter].position.y += highVolume * currAnimConfig.logo.highM.y[slice];
            logoTextMesh.slices[slice][letter].position.z += highVolume * currAnimConfig.logo.highM.z[slice];
            // mid work
            logoTextMesh.slices[slice][letter].position.y += midVolume * currAnimConfig.logo.midM.y[slice];
            logoTextMesh.slices[slice][letter].position.z += midVolume * currAnimConfig.logo.midM.z[slice];
            //low work
            logoTextMesh.slices[slice][letter].position.y += lowVolume * currAnimConfig.logo.lowM.y[slice];
            logoTextMesh.slices[slice][letter].position.z += lowVolume * currAnimConfig.logo.lowM.z[slice];
            //global work
            logoTextMesh.slices[slice][letter].position.y += globVolume * currAnimConfig.logo.globM.y[slice];
            logoTextMesh.slices[slice][letter].position.z += globVolume * currAnimConfig.logo.globM.z[slice];

        }
    }

    // Animate image mesh with last letter
    logoImageMesh.position.x = logoTextMesh.slices[0][textDivisions-1].position.x;
    logoImageMesh.position.y = logoTextMesh.slices[0][textDivisions-1].position.y;
    logoImageMesh.position.z = logoTextMesh.slices[0][textDivisions-1].position.z;
    // Position correction
    logoImageMesh.position.x -= 49;
    logoImageMesh.position.y -= 175;

    // Headings container position
    headingsContainer.position.y = currAnimConfig.headings.base.y;
    headingsContainer.position.z = currAnimConfig.headings.base.z;
    headingsContainer.position.y += globVolume * currAnimConfig.headings.globM.y;
    headingsContainer.position.z += globVolume * currAnimConfig.headings.globM.z;

    // Calculate camera direction
    cameraDirection.copy(baseCameraDirection);
    cameraDirection.x += cameraDir.x;
    cameraDirection.y += cameraDir.y;
    cameraDirection.z += cameraDir.z;
    // Calculate camera position
    cameraDirection.add(camera.position);
    camera.lookAt(cameraDirection);

    // Base camera positions
    camera.position.x = currAnimConfig.camera.base.x;
    camera.position.y = currAnimConfig.camera.base.y;
    camera.position.z = currAnimConfig.camera.base.z;
    camera.position.y += globVolume * currAnimConfig.camera.globM.y;
    camera.position.z += globVolume * currAnimConfig.camera.globM.z;

    // Extra illegal X-axis sizzle
    camera.position.x += Pumper.bands[high+6].volume * currAnimConfig.camera.globM.x;
    camera.position.x -= Pumper.bands[high+7].volume * currAnimConfig.camera.globM.x;
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
