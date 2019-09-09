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

var logoText = 'CONSOLETATION';

var textDivisions = logoText.length;

var camera, scene, renderer, composer;
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
    renderer.setClearColor(0x000000, 0.75);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1100;

    //Create scene
    scene = new THREE.Scene();

    initLogoText();
    initLogoImage();
    initHeading();

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
            map : texture, color: 0xffffff, transparent: true, opacity: 1
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
        logoTextLayerMesh2.material.opacity = 0.1;
        logoTextLayerContainer.add(logoTextLayerMesh2);
        slices2.push(logoTextLayerMesh2);

        logoTextLayerMesh3 = logoTextLayerMesh.clone();
        logoTextLayerMesh3.material = material.clone();
        logoTextLayerMesh3.position.set(posX, posY, 0);
        logoTextLayerMesh3.material.opacity = 0.1;
        logoTextLayerContainer.add(logoTextLayerMesh3);
        slices3.push(logoTextLayerMesh3);

        logoTextLayerMesh4 = logoTextLayerMesh.clone();
        logoTextLayerMesh4.material = material.clone();
        logoTextLayerMesh4.position.set(posX, posY, 0);
        logoTextLayerMesh4.material.opacity = 0.2;
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
    var texture = new THREE.TextureLoader().load('../../assets/controller-white.png');
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
    headingsContainer.position.y = -900;
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
            map: texture, color: 0xffffff, transparent: true, opacity: 1
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
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    testPass = new THREE.ShaderPass(THREE.TestShader);
    testPass.uniforms[ "amount" ].value = 0.95;
    composer.addPass(testPass);

    var shaderVignette = THREE.VignetteShader;
    var effectVignette = new THREE.ShaderPass(shaderVignette);
    effectVignette.uniforms.offset.value = 0.5;
    effectVignette.uniforms.darkness.value = 1.6;
    composer.addPass(effectVignette);

    var effectFilmPass = new THREE.FilmPass(0.12, 0.125, 648, false);
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
    var bandVolume;
    for (var i = 0 ; i < logoTextLayers1.length ; i ++){
        bandVolume = Pumper.bands[i].volume;
        logoTextLayers1[i].position.y = bandVolume * 0.1;
        logoTextLayers2[i].position.y = bandVolume * -0.2;
        logoTextLayers3[i].position.y = bandVolume * 0.5;
        logoTextLayers4[i].position.y = bandVolume * 0.3;
    }

    // Animate image mesh with volume of last band
    bandVolume = Pumper.bands[logoTextLayers1.length - 1].volume
    logoImageMesh.position.y = bandVolume * 0.1 - 175;

    // Give the camera a shove
    camera.position.y = Pumper.bands[5].volume * -0.1 - 90;
    camera.position.x = 0;
    camera.position.x += Pumper.bands[4].volume * 0.005;
    camera.position.x -= Pumper.bands[5].volume * 0.005;
    camera.position.z = 1100 - Pumper.bands[0].volume * 0.15;
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
    headingsContainer.remove(headingsMesh[currentHeading]);
    currentHeading++;
    if (currentHeading > headings.length - 1) {currentHeading = 0;}
    headingsContainer.add(headingsMesh[currentHeading]);
}

var BeatProcessing = {
    init: init
};

module.exports = BeatProcessing;
