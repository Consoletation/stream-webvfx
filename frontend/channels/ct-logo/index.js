var THREE = require('three');
require('imports?THREE=three!../../libs/objects/Water');
require('imports?THREE=three!../../libs/objects/Sky');
require('imports?THREE=three!../../libs/shaders/CopyShader');
require('imports?THREE=three!../../libs/shaders/DigitalGlitch');
require('imports?THREE=three!../../libs/shaders/FilmShader');
require('imports?THREE=three!../../libs/shaders/DotScreenShader');
require('imports?THREE=three!../../libs/shaders/VignetteShader');
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

var light, sky, water, cubeCamera;

function init() {

    //Create bands
    var bandMin = 10;
    var bandSize = Math.floor(80 / textDivisions);
    for (var i = 0 ; i < textDivisions ; i++){
        Pumper.createBand(bandMin, bandMin + bandSize, 127, 4 );
        bandMin += bandSize;
    }

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor(0xffffff, 1);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.set( 0, 90, 1100 );

    //Create scene
    scene = new THREE.Scene();

    initExtraBalls();
    initLogoText();
    initLogoImage();
    //initHeading();

    //Bring the lights
    scene.add(new THREE.AmbientLight(0xcacaca));

    initPostProcessing();

    window.addEventListener('resize', onWindowResize, false);

    frame();
}

function initExtraBalls(){
    light = new THREE.DirectionalLight( 0xffffff, 0.8 );
    scene.add( light );

    var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
    water = new THREE.Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( '../../assets/textures/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            } ),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    scene.add( water );

    // Skybox
    sky = new THREE.Sky();
    sky.scale.setScalar( 10000 );
    scene.add( sky );
    var uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = 10;
    uniforms[ "rayleigh" ].value = 2;
    uniforms[ "luminance" ].value = 1;
    uniforms[ "mieCoefficient" ].value = 0.005;
    uniforms[ "mieDirectionalG" ].value = 0.8;
    var parameters = {
        distance: 400,
        inclination: 0.49,
        azimuth: 0.205
    };

    cubeCamera = new THREE.CubeCamera( 1, 20000, 256 );
    cubeCamera.renderTarget.texture.generateMipmaps = true;
    cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    updateSun(parameters);

}

function updateSun(parameters) {
    var theta = Math.PI * ( parameters.inclination - 0.5 );
    var phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );
    light.position.x = parameters.distance * Math.cos( phi );
    light.position.y = parameters.distance * Math.sin( phi ) * Math.sin( theta );
    light.position.z = parameters.distance * Math.sin( phi ) * Math.cos( theta );
    sky.material.uniforms[ "sunPosition" ].value = light.position.copy( light.position );
    water.material.uniforms[ "sunDirection" ].value.copy( light.position ).normalize();
    cubeCamera.update( renderer, scene );
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
    logoTextLayerContainer.position.y += 280;
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
            map : texture, color: 0x000000, transparent: true, opacity: 1, depthWrite: false
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
    var texture = new THREE.TextureLoader().load('../../assets/controller.png');
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
        g.fillText(headings[heading], 0, 160);

        texture = new THREE.Texture(bitmap);
        texture.needsUpdate = true;
        texture.minFilter = THREE.LinearFilter;

        material = new THREE.MeshBasicMaterial({
            map: texture, color: 0x000000, transparent: true, opacity: 1
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

    var shaderVignette = THREE.VignetteShader;
    var effectVignette = new THREE.ShaderPass(shaderVignette);
    effectVignette.uniforms.offset.value = 0.5;
    effectVignette.uniforms.darkness.value = 2.6;
    composer.addPass(effectVignette);

    var effectFilmPass = new THREE.FilmPass(0.12, 0.125, 648, false);
    effectFilmPass.renderToScreen = true;
    composer.addPass(effectFilmPass);
}

function update() {
    Pumper.update();

    water.material.uniforms[ "time" ].value += 1.0 / 60.0;

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
    logoImageMesh.position.y = 280 + bandVolume * 0.1 - 175;

    var parameters = {
        distance: 400,
        inclination: 0.51 - (Pumper.bands[4].volume / 255 * 0.05),
        azimuth: 0.205
    };
    updateSun(parameters);


    // Give the camera a shove
    camera.position.y = 90 + Pumper.bands[5].volume * 0.01;
    camera.position.x = 0;
    camera.position.x += Pumper.bands[4].volume * 0.005;
    camera.position.x -= Pumper.bands[5].volume * 0.005;
    camera.position.z = 1100 - Pumper.bands[0].volume * 0.02;
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
    Pumper.play();  // if needed
    headingsContainer.remove(headingsMesh[currentHeading]);
    currentHeading++;
    if (currentHeading > headings.length - 1) {currentHeading = 0;}
    headingsContainer.add(headingsMesh[currentHeading]);
}

var BeatProcessing = {
    init: init
};

module.exports = BeatProcessing;
