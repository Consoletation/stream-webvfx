import * as THREE from 'three';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { TestShader } from '../../libs/three/shaders/TestShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

var logoText = 'WWF';
var logoSpacing = 460;

var textDivisions = logoText.length;

var camera, scene, renderer, composer;
var logoTextMesh = [];
var logoImageMesh;

function init() {
    //Create bands
    window.pumper.createBands(textDivisions, 1, 1.25);

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('click', click);
    renderer.setClearColor(0x000000, 0);

    //Create camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 2100;

    //Create scene
    scene = new THREE.Scene();

    initLogoText();
    initLogoImage();

    //Bring the lights
    scene.add(new THREE.AmbientLight(0xcacaca));

    initPostProcessing();

    window.addEventListener('resize', onWindowResize, false);

    frame();
}

function initLogoText() {
    var letters = {
        W: new THREE.TextureLoader().load('../../assets/wwf/wwf_w.png'),
        F: new THREE.TextureLoader().load('../../assets/wwf/wwf_f.png'),
    };
    var letterSize = {
        W: { width: 446, height: 342 },
        F: { width: 288, height: 342 },
    };
    //Create shapes container
    var texture,
        material,
        geometry,
        logoTextLayerContainer,
        logoTextLayerMesh,
        logoTextLayerMesh2,
        logoTextLayerMesh3,
        logoTextLayerMesh4,
        divisionWidth,
        divisionHeight,
        slices1,
        slices2,
        slices3,
        slices4,
        posX,
        posY,
        charOffset = 0;

    //create text image
    // canvas contents will be used for a texture
    logoTextLayerContainer = new THREE.Object3D();
    scene.add(logoTextLayerContainer);

    slices1 = [];
    slices2 = [];
    slices3 = [];
    slices4 = [];
    for (var j = 0; j < textDivisions; j++) {
        //Dirty as fuck, but I've got to create a canvas per logo slice
        //Also, weirdly the width can't seem to be set after adding a text in
        divisionWidth = letterSize[logoText.charAt(j)].width;
        divisionHeight = letterSize[logoText.charAt(j)].height;

        texture = letters[logoText.charAt(j)];
        material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
        geometry = new THREE.PlaneGeometry(divisionWidth, divisionHeight);
        posX = charOffset - divisionWidth * 0.5;
        posY = 0;
        var next = letterSize[logoText.charAt(j + 1)];
        if (next) {
            charOffset += next.width;
        }

        logoTextLayerMesh = new THREE.Mesh(geometry, material);
        logoTextLayerMesh.material.opacity = 1.0;
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
        slices4: slices4,
    });
}

function initLogoImage() {
    var texture = new THREE.TextureLoader().load('../../assets/wwf/wwf_panda.png');
    var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    var geometry = new THREE.PlaneGeometry(1200, 1357);

    logoImageMesh = new THREE.Mesh(geometry, material);
    logoImageMesh.material.side = THREE.DoubleSide;
    logoImageMesh.material.opacity = 1.0;
    logoImageMesh.position.x = 140; // y is determined in update()

    scene.add(logoImageMesh);
}

function initPostProcessing() {
    // postprocessing
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    var testPass = new ShaderPass(TestShader);
    testPass.uniforms['amount'].value = 0.95;
    composer.addPass(testPass);

    var shaderVignette = VignetteShader;
    var effectVignette = new ShaderPass(shaderVignette);
    effectVignette.uniforms.offset.value = 0.0;
    effectVignette.uniforms.darkness.value = 0.0;
    composer.addPass(effectVignette);

    var effectFilmPass = new FilmPass(0.0, 0.0, 648, false);
    effectFilmPass.renderToScreen = true;
    composer.addPass(effectFilmPass);
}

function update() {
    window.pumper.update();

    //Animate logo text layers based on bands
    var logoTextLayers1 = logoTextMesh[0].slices1;
    var logoTextLayers2 = logoTextMesh[0].slices2;
    var logoTextLayers3 = logoTextMesh[0].slices3;
    var logoTextLayers4 = logoTextMesh[0].slices4;
    var bandVolume;
    for (var i = 0; i < logoTextLayers1.length; i++) {
        bandVolume = window.pumper.bands[i].volume;
        // Band corrections
        if (i === 2) {
            bandVolume = bandVolume * 1.2;
        }
        bandVolume = bandVolume * 2; // Multiplier
        logoTextLayers1[i].position.y = bandVolume * 0.2 - logoSpacing;
        logoTextLayers2[i].position.y = bandVolume * 0.05 - logoSpacing;
        logoTextLayers3[i].position.y = bandVolume * 0.4 - logoSpacing;
        logoTextLayers4[i].position.y = bandVolume * 0.3 - logoSpacing;
    }

    // Animate image mesh with volume of last band
    bandVolume = window.pumper.bands[logoTextLayers1.length - 1].volume;
    logoImageMesh.position.y = bandVolume * 0.2 + logoSpacing;

    // Give the camera a shove
    camera.position.y = window.pumper.bands[1].volume * -0.1;
    //-camera.position.x =- 2500;
    camera.position.x = window.pumper.bands[0].volume * 0.05;
    camera.position.x -= window.pumper.bands[2].volume * 0.05;
    camera.position.z = 2100 - window.pumper.bands[0].volume * 0.35;
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
    //window.pumper.play();  // if needed
}

var BeatProcessing = {
    init: init,
};

export default BeatProcessing;
