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

var logoText = 'CONSOLETATION';

var textDivisions = logoText.length;

var camera, scene, renderer, composer, glitchPass;
var logoTextMesh = [];
var logoImageMesh;
var headingsContainer;
var headingsMesh = [];
var headings = [
    'Starting soon...',
    'Back soon!',
    'Thanks for watching!'
];
var currentHeading = 0;

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
    camera.position.z = 1100;

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
            map : texture, color: currentConfig.textColor, transparent: true, opacity: 1
        });

        posX = charOffset - txtWidth * 0.5;
        posY = 0;
        charOffset += divisionWidth;

        logoTextLayerMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(divisionWidth, 200), material);
        logoTextLayerMesh.material.opacity = 0.6;
        logoTextLayerMesh.position.set(posX, posY, 0);
        logoTextLayerContainer.add(logoTextLayerMesh);
        slices1.push(logoTextLayerMesh);

        logoTextLayerMesh2 = logoTextLayerMesh.clone();
        logoTextLayerMesh2.material = material.clone();
        logoTextLayerMesh2.position.set(posX, posY, 0);
        logoTextLayerMesh2.material.opacity = 0.05;
        logoTextLayerContainer.add(logoTextLayerMesh2);
        slices2.push(logoTextLayerMesh2);

        logoTextLayerMesh3 = logoTextLayerMesh.clone();
        logoTextLayerMesh3.material = material.clone();
        logoTextLayerMesh3.position.set(posX, posY, 0);
        logoTextLayerMesh3.material.opacity = 0.05;
        logoTextLayerContainer.add(logoTextLayerMesh3);
        slices3.push(logoTextLayerMesh3);

        logoTextLayerMesh4 = logoTextLayerMesh.clone();
        logoTextLayerMesh4.material = material.clone();
        logoTextLayerMesh4.position.set(posX, posY, 0);
        logoTextLayerMesh4.material.opacity = 0.1;
        logoTextLayerContainer.add(logoTextLayerMesh4);
        slices4.push(logoTextLayerMesh4);
    }
    logoTextMesh.push({
        container: logoTextLayerContainer,
        slices1: slices1,
        slices2: slices2,
        slices3: slices3,
        slices4: slices4
    });
}

function initLogoImage(){
    var texture = new THREE.TextureLoader().load(currentConfig.contLogo);
    var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    var geometry = new THREE.PlaneGeometry(256, 256);

    logoImageMesh = new THREE.Mesh( geometry, material );
    logoImageMesh.material.side = THREE.DoubleSide;
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

    //Animate logo text layers based on bands
    var logoTextLayers1 = logoTextMesh[0].slices1;
    var logoTextLayers2 = logoTextMesh[0].slices2;
    var logoTextLayers3 = logoTextMesh[0].slices3;
    var logoTextLayers4 = logoTextMesh[0].slices4;
    var low = 0, mid = textDivisions, high = textDivisions*2
    var lowVolume = 0, midVolume = 0, highVolume = 0;
    for (var i = 0 ; i < logoTextLayers1.length ; i ++){
        // Bass positions
        logoTextLayers1[i].position.y = 0;
        logoTextLayers2[i].position.y = 8;
        logoTextLayers3[i].position.y = 0;
        logoTextLayers4[i].position.y = 0;
        logoTextLayers1[i].position.z = 0;
        logoTextLayers2[i].position.z = 0;
        logoTextLayers3[i].position.z = 0;
        logoTextLayers4[i].position.z = 0;

        // Band volumes
        lowVolume = Pumper.bands[low+i].volume;
        midVolume = Pumper.bands[mid+i].volume;
        highVolume = Pumper.bands[high+i].volume;

        // high work
        logoTextLayers1[i].position.y += highVolume * 1;
        logoTextLayers2[i].position.y += highVolume * 0.1;
        logoTextLayers3[i].position.y += highVolume * 1.95;
        logoTextLayers4[i].position.y += highVolume * 1.5;

        // mid work
        logoTextLayers1[i].position.y += midVolume * 0.5;
        logoTextLayers2[i].position.y += midVolume * 0.1;
        logoTextLayers3[i].position.y += midVolume * 0.8;
        logoTextLayers4[i].position.y += midVolume * 0.4;

        // low work
        var zDepth = (Pumper.volume*0.5 + lowVolume)
        logoTextLayers1[i].position.z += zDepth;
        logoTextLayers2[i].position.z += zDepth;
        logoTextLayers3[i].position.z += zDepth;
        logoTextLayers4[i].position.z += zDepth;
    }

    // Animate image mesh with last letter
    lowVolume = Pumper.bands[low+logoTextLayers1.length - 1].volume
    midVolume = Pumper.bands[mid+logoTextLayers1.length - 1].volume
    highVolume = Pumper.bands[high+logoTextLayers1.length - 1].volume
    logoImageMesh.position.y = -175;
    logoImageMesh.position.y += midVolume * 0.5;
    logoImageMesh.position.y += highVolume * 1;
    logoImageMesh.position.z = (Pumper.volume*0.5 + lowVolume);

    headingsContainer.position.y = -1100;
    headingsContainer.position.z = 0;
    headingsContainer.position.y += Pumper.volume * 0.3;
    headingsContainer.position.z = Pumper.volume * 0.0;

    // Base camera positions
    camera.position.x = 0;
    camera.position.y = -90;
    camera.position.z = 1100;
    // Give the camera a shove
    camera.position.x += Pumper.bands[high+6].volume;
    camera.position.x -= Pumper.bands[high+7].volume;
    camera.position.y += Pumper.volume*-1.5 * -0.2;
    camera.position.z -= Pumper.volume * 0.09;
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
