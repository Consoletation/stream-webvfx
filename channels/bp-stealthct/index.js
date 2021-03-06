import * as THREE from 'three';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';
import { TestShader } from '../../libs/three/shaders/TestShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from '../../libs/three/postprocessing/GlitchPassCustom.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

import Pumper from 'pumper';

var Datas = require('./datas');

var _ift = Date.now();
var glitchTimeout;

var bgColors = [0x050505, 0xd4fa7a, 0x6befac, 0x42ACCC, 0xCC7E6A, 0x7868FF, 0xFDFF98, 0x5B9CB2];
var colors = [0x427cde, 0xffffff, 0xa7a7a7, 0xB23A5E, 0xFFB86C, 0x32AEB2, 0xFF4E46, 0xD7FF56];
var currentColor = 0;

var main;
var divisions = 16, bands = [];

var camera, scene, renderer, composer, glitchPass;
var shapesContainer, light;
var shapeMesh, shapeMaterial, shapeGeometry;
var shapeStrokeLine, shapeStrokeLine, shapeStrokeGeometry;
var namesMesh = [];
var currentName = 6;
var currentShape = 0;
var glitchPass;
var stage = 0;

var randomCircleScale = 0;

function init() {

    Datas.names = shuffle(Datas.names);
    Datas.names.unshift('Thanks for watching');
    Datas.names.unshift('Back soon');
    Datas.names.unshift('Welcome to Consoletation');
    Datas.names.unshift('Thank you for the support');
    Datas.names.unshift('DUMMY');
    Datas.names.unshift('Starting soon');

    //Create bands
    Pumper.createBands(divisions, 1, 1.25);

    //Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.domElement.addEventListener('click', simulateBeat);
    renderer.setClearColor( 0x000000, 1 );

    //Create camera
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 900;

    //Create scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0x000000, 1, 2000 );

    initShape();
    initCircle();
    initName();

    //Bring the lights
    scene.add( new THREE.AmbientLight( 0xcacaca ) );
    // light = new THREE.DirectionalLight( 0xffffff );
    // light.position.set( 1, 1, 1 );
    // scene.add( light );


    initPostProcessing();

    window.addEventListener( 'resize', onWindowResize, false );
    glitchPass.goWild = false;


    _t = _ft = _rft = Date.now();
    frame();
}

function initName(){
    //Create shapes container
    var namesSize = 1024;
    namesContainer = new THREE.Object3D();
    namesContainer.position.x =  window.innerWidth * 0.5;
    namesContainer.position.y =  window.innerHeight * -0.5;
    scene.add( namesContainer );

    var txtWidth, bitmap,
        g,
        texture, material, nameSlicesContainer,
        nameMesh, nameMesh2, nameMesh3, nameMesh4, nameMesh5,
        divisionWidth, slices1, slices2, slices3, slices4, slices5,
        posX, posY,
        i = 0, j = 0;

    //create text image
    currentColor = THREE.Math.randInt(0, colors.length - 1);
    for (i = 0 ; i < Datas.names.length ; i ++){

        // canvas contents will be used for a texture
        nameSlicesContainer = new THREE.Object3D();
        nameSlicesContainer.position.x = window.innerWidth * -0.5;
        nameSlicesContainer.position.y = window.innerHeight * 0.5;

        slices1 = [];
        slices2 = [];
        slices3 = [];
        slices4 = [];
        for (j = 0 ; j < divisions ; j ++){
            //Dirty as fuck, but I've got to create a canvas per name's slice
            //Also, weirdly the width can't seem to be set after adding a text in
            bitmap = document.createElement('canvas');
            g = bitmap.getContext('2d');
            bitmap.width = namesSize;
            bitmap.height = 200;
            g.font = 'bold 160px Patua One';
            g.fillStyle = 'white';
            txtWidth = g.measureText(Datas.names[i]).width;
            divisionWidth = txtWidth / divisions

            bitmap.width = divisionWidth;
            g.font = 'bold 160px Patua One';
            g.fillStyle = 'white';
            txtWidth = g.measureText(Datas.names[i]).width;
            g.fillText(Datas.names[i], (divisionWidth * j) * -1, 160 );

            texture = new THREE.Texture(bitmap)
            texture.needsUpdate = true;
            texture.minFilter = THREE.LinearFilter;

            material = new THREE.MeshBasicMaterial( {
                map : texture, color: 0xffffff, transparent: true, opacity: 1
            });

            posX = j * (divisionWidth) - txtWidth * 0.5;
            posY = 0;

            nameMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(divisionWidth, 200), material);
            nameMesh.material.opacity = 0.6;
            nameMesh.position.set(posX, posY, 0);
            nameSlicesContainer.add( nameMesh );
            slices1.push(nameMesh)

            nameMesh2 = nameMesh.clone();
            nameMesh2.material = material.clone();
            // nameMesh2.rotation.z = -0.1;
            nameMesh2.position.set(posX, posY, 0);
            nameMesh2.material.opacity = 0.1;
            nameSlicesContainer.add( nameMesh2 );
            slices2.push(nameMesh2)

            nameMesh3 = nameMesh.clone();
            // nameMesh3.rotation.z = 0.1;
            nameMesh3.material = material.clone();
            nameMesh3.position.set(posX, posY, 0);
            // nameMesh3.scale.set(3, 3, 3);
            nameMesh3.material.opacity = 0.1;
            nameSlicesContainer.add( nameMesh3 );
            slices3.push(nameMesh3)

            nameMesh4 = nameMesh.clone();
            // nameMesh4.rotation.z = 0.14;
            nameMesh4.material = material.clone();
            nameMesh4.position.set(posX, posY, 0);
            nameMesh4.material.opacity = 0.2;
            nameSlicesContainer.add( nameMesh4 );
            slices4.push(nameMesh4)
        }
        namesMesh.push({
            container: nameSlicesContainer,
            slices1: slices1,
            slices2: slices2,
            slices3: slices3,
            slices4: slices4
        });
    }
    namesContainer.add( namesMesh[0].container );

}
function initCircle(){
    var segmentCount = 256,
    radius = 200,
    geometry = new THREE.Geometry();

    for (var i = 0; i <= segmentCount; i++) {
        var theta = (i / segmentCount) * Math.PI * 2;
        geometry.vertices.push(
            new THREE.Vector3(
                Math.cos(theta) * radius,
                Math.sin(theta) * radius,
                0));
    }


    circleLine = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
            opacity: 0.1,
            transparent: true
        })
    );
    scene.add( circleLine );
}
function initShape(){
    //Create shapes container
    shapesContainer = new THREE.Object3D();
    scene.add( shapesContainer );

    //Create current shape and its stroke
    var shapeStaticPoints = Datas.shapes[currentShape].points;
    shapePoints = [];
    //Get shape's points from the shapes file
    for (var i = 0 ; i < shapeStaticPoints.length ; i ++){
        shapePoints.push( new THREE.Vector3( shapeStaticPoints[i].x, shapeStaticPoints[i].y, 0) );
    }

    //Create current shape
    shape = new THREE.Shape( shapePoints );
    shapeStrokeGeometry = shape.createPointsGeometry();
    var spacedPoints = shape.createSpacedPointsGeometry( 20 );

    shapeGeometry = new THREE.ShapeGeometry( shape );
    shapeGeometry.vertices.push( new THREE.Vector3( shapeStaticPoints[0].x, shapeStaticPoints[0].y, 0) );
    shapeMaterial = new THREE.MeshPhongMaterial( { color: colors[currentColor], flatShading: true } );
    shapeMesh = new THREE.Mesh( shapeGeometry, shapeMaterial );
    shapesContainer.add( shapeMesh );

    //Create stroke
    shapeStrokeMaterial = new THREE.LineBasicMaterial( {
        color: colors[currentColor], opacity: 0.5, transparent: true} );
    shapeStrokeLine = new THREE.LineSegments(shapeStrokeGeometry, shapeStrokeMaterial);
    shapeStrokeLine.scale.set(1.2, 1.2, 1.2)
    shapesContainer.add( shapeStrokeLine );
    // shapeStrokeLine.rotation.x = 10;
}

function initPostProcessing(){
    // postprocessing
    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );

    var testPass = new ShaderPass(TestShader);
    testPass.uniforms[ "amount" ].value = 0.88;
    composer.addPass(testPass);

    glitchPass = new GlitchPass();
    // glitchPass.renderToScreen = true;
    composer.addPass( glitchPass );

    var shaderVignette = VignetteShader;
    var effectVignette = new ShaderPass( shaderVignette );
    effectVignette.uniforms[ "offset" ].value = 0.5;
    effectVignette.uniforms[ "darkness" ].value = 1.6;
    composer.addPass( effectVignette );

    effectFilmPass = new FilmPass( 0.12, 0.125, 648, false );
    effectFilmPass.renderToScreen = true;
    composer.addPass( effectFilmPass );
}


function simulateBeat(){
    glitchPass.goWild = true;
    setTimeout(function (){
        glitchPass.goWild = false;
    }, 300)

    stage++;
    tweenVertices(0.5);
}

function tweenVertices(duration){

    if(stage === 1){
        //Scale circle randomly but still based on the volume
        //Position it randomly on every single BOOOOOM
        randomCircleScale = THREE.Math.randInt( Pumper.volume * 0.2, Pumper.volume ) * 0.01 - 1.4;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        circleLine.position.x = THREE.Math.randInt( window.innerWidth * -0.5, window.innerWidth * 0.5);
        circleLine.position.y = THREE.Math.randInt( windowHeight * -0.5, windowHeight * 0.5);
    
        //Change color of the shape
        currentColor ++;
        if(currentColor > colors.length - 1){
            currentColor = 0;
        }
        shapeMaterial.color.setHex( colors[currentColor] );
        shapeStrokeMaterial.color.setHex( colors[currentColor] );
        renderer.setClearColor( bgColors[currentColor ], 0.5 );
        // setTimeout(function(){
            // renderer.setClearColor( colors[currentColor ], 0.5 );
        // }, 100);
    }

    //Change name
    if(stage === 1){
        namesContainer.remove( namesMesh[currentName].container );
        currentName ++;
        if(currentName > namesMesh.length - 1){
            currentName = 6;
        } else if(currentName < 6){
            currentName = 6;
        }
        namesContainer.add( namesMesh[currentName].container );
    }else{
        namesContainer.remove( namesMesh[currentName].container );
        currentName = stage;
        namesContainer.add( namesMesh[currentName].container );
    }

    if(stage === 1){
        //Rotate shape
        var shapeRotation = THREE.Math.randInt(-45, 45) * Math.PI / 180;
        TweenMax.to(shapeMesh.rotation, duration, {
            z:  shapeRotation,
            ease: Cubic.easeInOut
        })
        TweenMax.to(shapeStrokeLine.rotation, duration + 0.05, {
            z:  shapeRotation,
            ease: Cubic.easeInOut
        })

        //Change shape
        currentShape ++ ;
        if( currentShape >= Datas.shapes.length ){
            currentShape = 0;
        }
        var shapeStaticPoints = Datas.shapes[currentShape].points;
        shapePoints = [];
        //Get shape's points from the shapes file
        for (var i = 0 ; i < shapeStaticPoints.length ; i ++){
            shapePoints.push( new THREE.Vector3( shapeStaticPoints[i].x, shapeStaticPoints[i].y, 0) );
        }
        shapePoints.push( new THREE.Vector3( shapeStaticPoints[0].x, shapeStaticPoints[0].y, 0) );
    
        TweenMax.to(shapeGeometry.vertices[i], duration, {
            x: shapePoints[i].x,
            y: shapePoints[i].y,
            delay: 0,
            ease: Cubic.easeInOut
        })
    }

    //Tween vertices
    for (var i = 0 ; i < shapeGeometry.vertices.length - 1 ; i ++){
        TweenMax.to(shapeGeometry.vertices[i], duration, {
            x: shapePoints[i].x,
            y: shapePoints[i].y,
            ease: Cubic.easeInOut
        })
        TweenMax.to(shapeStrokeGeometry.vertices[i], duration + 0.05, {
            x: shapePoints[i].x,
            y: shapePoints[i].y,
            ease: Cubic.easeInOut,
            onUpdate: function(){
                shapeGeometry.verticesNeedUpdate = true;
                shapeStrokeGeometry.verticesNeedUpdate = true;
            }
        })
    }
}

function update() {
    _t = Date.now();

    Pumper.update();

    //Animate names based on bands
    var currentNameSlices1 = namesMesh[currentName].slices1;
    var currentNameSlices2 = namesMesh[currentName].slices2;
    var currentNameSlices3 = namesMesh[currentName].slices3;
    var currentNameSlices4 = namesMesh[currentName].slices4;
    // console.log(Pumper.bands[0].volume);
    var bandVolume;
    for (var i = 0 ; i < currentNameSlices1.length ; i ++){
        bandVolume = Pumper.bands[i].volume;
        // currentNameSlices1[i].scale.set(1 + bandVolume * 0.01, 1 + bandVolume * 0.01, 1);
        currentNameSlices1[i].position.y = bandVolume * 0.1;
        currentNameSlices2[i].position.y = bandVolume * -0.2;
        currentNameSlices3[i].position.y = bandVolume * 0.5;
        currentNameSlices4[i].position.y = bandVolume * 0.3;
    }
    if(Pumper.isSpiking === true) {
        var volume = Math.floor((Pumper.volume * 0.7));
        var scale = 0.9 + (volume * 0.1);

        tweenVertices(scale * 0.02);

        if(stage === 1){
            if(glitchPass.goWild === false){
                glitchPass.goWild = Pumper.isSpiking;
                glitchTimeout = setTimeout(function (){
                    if(Pumper.isSpiking === false){
                        glitchPass.goWild = false;
                    }
                }, volume * 1.5)
            }else{
                clearTimeout( glitchTimeout )
                glitchTimeout = setTimeout(function (){
                    if(Pumper.isSpiking === false){
                        glitchPass.goWild = false;
                    }
                }, volume * 1.5)
            }
        }
    }
    // camera.rotation.x = Pumper.volume * -0.0005;
    scale = Pumper.volume * 0.002 + 1;
    shapeMesh.scale.set(scale, scale, scale);
    circleScale = randomCircleScale + (scale * 1.3);
    circleLine.scale.set(circleScale, circleScale, circleScale);
    setTimeout(function (){
        shapeStrokeLine.scale.set(scale + 0.1, scale + 0.1, scale + 0.1);
    }, 10)
}

function frame() {
    requestAnimationFrame(frame);
    update();
    composer.render();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function shuffle(array) {
    var counter = array.length, temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}




var BeatProcessing = {
    init: init
};

export default BeatProcessing;
