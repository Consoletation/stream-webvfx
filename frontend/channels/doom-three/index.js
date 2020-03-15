var THREE = require('three');
require('imports?THREE=three!../../libs/shaders/CopyShader');
require('imports?THREE=three!../../libs/shaders/DigitalGlitch');
require('imports?THREE=three!../../libs/shaders/FilmShader');
require('imports?THREE=three!../../libs/shaders/DotScreenShader');
require('imports?THREE=three!../../libs/shaders/VignetteShader');
require('imports?THREE=three!../../libs/shaders/TestShader');
require('imports?THREE=three!../../libs/postprocessing/EffectComposer');
require('imports?THREE=three!../../libs/postprocessing/RenderPass');
require('imports?THREE=three!../../libs/postprocessing/MaskPass');
require('imports?THREE=three!../../libs/postprocessing/ShaderPass');
require('imports?THREE=three!../../libs/postprocessing/FilmPass');
require('imports?THREE=three!../../libs/postprocessing/DotScreenPass');

var Pumper = require('pumper');

var logoText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var textDivisions = logoText.length;

var camera, scene, renderer, composer;
var logoTextMesh = [];
var logoImageMesh;

function init() {

    //Create bands
    var bandMin = 10;
    var bandSize = Math.floor(80 / textDivisions);
    for (var i = 0 ; i < textDivisions ; i++){
        Pumper.createBand(bandMin, bandMin + bandSize, 127, 4 );
        bandMin += bandSize;
    }

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor(0x000000, 0);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.x =- 1100;
    camera.position.z = 1100;

    //Create scene
    scene = new THREE.Scene();

    initLogoText();
    //initLogoImage();

    //Bring the lights
    scene.add(new THREE.AmbientLight(0xcacaca));

    initPostProcessing();

    window.addEventListener('resize', onWindowResize, false);

    frame();
}

function initLogoText(){
    //Create shapes container
    var txtWidth, bitmap,
        g,
        texture, material, logoTextLayerContainer,
        logoTextLayerMesh, logoTextLayerMesh2, logoTextLayerMesh3, logoTextLayerMesh4,
        divisionWidth, slices1,
        posX, posY, charOffset = 0;

    //create text image
    // canvas contents will be used for a texture
    logoTextLayerContainer = new THREE.Object3D();
    scene.add(logoTextLayerContainer);

    slices1 = [];
    for (var j = 0 ; j < textDivisions ; j ++){
        //Dirty as fuck, but I've got to create a canvas per logo slice
        //Also, weirdly the width can't seem to be set after adding a text in
        bitmap = document.createElement('canvas');
        g = bitmap.getContext('2d');
        bitmap.width = 1024;
        bitmap.height = 200;
        g.font = '300 160px Turnpike';
        g.fillStyle = 'white';
        divisionWidth = g.measureText(logoText.charAt(j)).width;
        if (logoText.charAt(j) === 'A'){ divisionWidth = 170;}
        if (logoText.charAt(j) === 'B'){ divisionWidth = 170;}
        if (logoText.charAt(j) === 'H'){ divisionWidth = 160;}
        if (logoText.charAt(j) === 'I'){ divisionWidth = 90;}
        if (logoText.charAt(j) === 'L'){ divisionWidth = 170;}
        if (logoText.charAt(j) === 'M'){ divisionWidth = 190;}
        if (logoText.charAt(j) === 'V'){ divisionWidth = 190;}
        if (logoText.charAt(j) === 'W'){ divisionWidth = 230;}

        bitmap.width = divisionWidth;
        g.font = '300 160px Turnpike';
        g.fillStyle = 'white';
        txtWidth = g.measureText(logoText).width;
        g.fillText(logoText.charAt(j), 0, 160 );

        texture = new THREE.Texture(bitmap);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        material = new THREE.MeshBasicMaterial({
            map : texture, color: 0xffffff, transparent: true, opacity: 1
        });

        posX = charOffset - txtWidth * 0.5;
        posY = 0;
        charOffset += divisionWidth;

        logoTextLayerMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(divisionWidth, 200), material);
        logoTextLayerMesh.material.opacity = 0.95;
        logoTextLayerMesh.position.set(posX, posY, 0);
        logoTextLayerContainer.add(logoTextLayerMesh);
        slices1.push(logoTextLayerMesh);
    }
    logoTextMesh.push({
        container: logoTextLayerContainer,
        slices1: slices1,
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

function initPostProcessing(){
    // postprocessing
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    testPass = new THREE.ShaderPass(THREE.TestShader);
    testPass.uniforms[ "amount" ].value = 0.95;
    composer.addPass(testPass);

    var shaderVignette = THREE.VignetteShader;
    var effectVignette = new THREE.ShaderPass(shaderVignette);
    effectVignette.uniforms.offset.value = 0.0;
    effectVignette.uniforms.darkness.value = 0.0;
    composer.addPass(effectVignette);

    var effectFilmPass = new THREE.FilmPass(0.0, 0.0, 648, false);
    effectFilmPass.renderToScreen = true;
    composer.addPass(effectFilmPass);
}

function update() {
    Pumper.update();

    //Animate logo text layers based on bands
    var logoTextLayers1 = logoTextMesh[0].slices1;
    var bandVolume;
    for (var i = 0 ; i < logoTextLayers1.length ; i ++){
        bandVolume = Pumper.bands[i].volume;
        logoTextLayers1[i].position.y = bandVolume;
    }

    // Give the camera a shove
    camera.position.z = 2800 - Pumper.bands[0].volume * 0.15;
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
}

var BeatProcessing = {
    init: init
};

module.exports = BeatProcessing;
