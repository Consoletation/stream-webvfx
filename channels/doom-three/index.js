import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import Pumper from 'pumper';
import { WebMidi } from 'webmidi';
import TWEEN from '@tweenjs/tween.js';

const pumperBandCount = 26;

var logoText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var camera, scene, renderer, composer;
var logoTextMesh = [];
var logoImageMesh;

const cameraInitPos = { x: 0, y: 0, z: 1800 };

var clockInput;
var clockCounter = 0;

// Tweening
var tweenBeatCoords = { x: 0, y: 0, z: 0 };
const tweenBeatIn = new TWEEN.Tween(tweenBeatCoords)
    .to({ x: 0, y: 0, z: -30 }, 80)
    .easing(TWEEN.Easing.Quadratic.Out);
const tweenBeatOut = new TWEEN.Tween(tweenBeatCoords)
    .to({ x: 0, y: 0, z: 0 }, 200)
    .easing(TWEEN.Easing.Quadratic.Out);
tweenBeatIn.chain(tweenBeatOut);
var tweenAnimCoords = { x: 0, y: 0, z: 0 };
const tweenAnimIn = new TWEEN.Tween(tweenAnimCoords)
    .to({ x: 0, y: -3000, z: 0 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);
const tweenAnimOut = new TWEEN.Tween(tweenAnimCoords)
    .to({ x: 0, y: 0, z: 0 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);
tweenAnimIn.chain(tweenAnimOut);

function init() {

    WebMidi.enable(function (err) {
        if (err) {
            console.log("WebMidi could not be enabled.", err);
        }
        clockInput = WebMidi.getInputByName("DJM-900NXS2");
        clockInput.addListener('clock', "all", function(e) {
            clockCounter++;
        })
    });

    //Create bands
    Pumper.createBands(logoText.length, 1, 1.25);

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor(0x000000, 0);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    Object.assign(camera.position, cameraInitPos);

    //Create scene
    scene = new THREE.Scene();

    initLogoText("twitch.tv/StealthCT", 0);
    initLogoText("Friday 6pm GMT / 1pm CDT", -300, 160);
    //initLogoText("MorrowindInMySails", 500);
    //initLogoText("raiding with a party of", 100);
    //initLogoText("69", -300);
    //initLogoImage();

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    window.addEventListener('resize', onWindowResize, false);

    frame();
}

function initLogoText(alertTextP, posY, posX2 = 0, posZ = 0){
    //Create shapes container
    var txtWidth, bitmap, alertText,
        g,
        texture, material, logoTextLayerContainer,
        logoTextLayerMesh,
        divisionWidth, slices,
        posX, charOffset = 0;

    alertText = alertTextP.toUpperCase();

    //create text image
    // canvas contents will be used for a texture
    logoTextLayerContainer = new THREE.Object3D();
    scene.add(logoTextLayerContainer);

    slices = [];
    for (var j = 0 ; j < alertText.length ; j ++){
        //Dirty as fuck, but I've got to create a canvas per logo slice
        //Also, weirdly the width can't seem to be set after adding a text in
        bitmap = document.createElement('canvas');
        g = bitmap.getContext('2d');
        bitmap.width = 1024;
        bitmap.height = 200;
        g.font = '300 160px Turnpike';
        g.fillStyle = 'white';
        divisionWidth = g.measureText(alertText.charAt(j)).width;
        if (alertText.charAt(j) === 'A'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'B'){ divisionWidth = 170;}
        if (alertText.charAt(j) === 'C'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'E'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'H'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'I'){ divisionWidth = 130;}
        if (alertText.charAt(j) === 'L'){ divisionWidth = 170;}
        if (alertText.charAt(j) === 'M'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'S'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'T'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'V'){ divisionWidth = 190;}
        if (alertText.charAt(j) === 'W'){ divisionWidth = 230;}
        if (alertText.charAt(j) === '/'){ divisionWidth = 160;}
        if (alertText.charAt(j) === '.'){ divisionWidth = 110;}
        if (alertText.charAt(j) === '1'){ divisionWidth = 130;}

        bitmap.width = divisionWidth;
        g.font = '300 160px Turnpike';
        g.fillStyle = 'white';
        txtWidth = g.measureText(alertText).width;
        g.fillText(alertText.charAt(j), 0, 160 );

        texture = new THREE.Texture(bitmap);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        material = new THREE.MeshBasicMaterial({
            map : texture, color: 0xffffff, transparent: true, opacity: 1
        });

        posX = posX2 + charOffset - txtWidth * 0.5;
        //posY = 0;
        charOffset += divisionWidth;

        logoTextLayerMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(divisionWidth, 200), material);
        logoTextLayerMesh.material.opacity = 0.95;
        logoTextLayerMesh.position.set(posX, posY, posZ);
        logoTextLayerContainer.add(logoTextLayerMesh);
        slices.push(logoTextLayerMesh);
    }
    logoTextMesh.push({
        container: logoTextLayerContainer,
        slices: slices,
        height: posY,
    });
}

function initLogoImage(){
    var texture = new THREE.TextureLoader().load('../../assets/controller-white.png');
    var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    var geometry = new THREE.PlaneGeometry(256, 256);

    logoImageMesh = new THREE.Mesh( geometry, material );
    logoImageMesh.material.side = THREE.DoubleSide;
    logoImageMesh.position.x = 557;  // y is determined in update()

    scene.add(logoImageMesh);
}

function update() {
    Pumper.update();
    TWEEN.update();

    // Beat tween
    if (clockCounter > 23) {
        clockCounter = 1;
        tweenBeatIn.start();
        console.log("Beat!");
    }

    //Animate logo text layers based on bands
    var logoTextLayers;
    var bandVolume;
    for (var j = 0; j < logoTextMesh.length; j++) {
        logoTextLayers = logoTextMesh[j].slices;
        for (var i = 0 ; i < logoTextLayers.length ; i ++){
            bandVolume = Pumper.bands[i].volume;
            logoTextLayers[i].position.y = logoTextMesh[j].height + bandVolume;
        }
    }

    // Camera changes
    let cameraNewPos = {x: 0, y: 0, z: 0};
    Object.assign(cameraNewPos, cameraInitPos);
    //cameraNewPos.z -= Pumper.bands[0].volume * 0.15; // Pumper Z shove
    cameraNewPos.z += tweenBeatCoords.z; // Beat shove
    cameraNewPos.x += tweenAnimCoords.x; // Anim shove
    cameraNewPos.y += tweenAnimCoords.y; // Anim shove
    cameraNewPos.z += tweenAnimCoords.z; // Anim shove
    Object.assign(camera.position, cameraNewPos);
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
    console.log('click!');
    tweenAnimIn.start();
    //Pumper.play();  // if needed
}

var BeatProcessing = {
    init: init
};

export default BeatProcessing;
