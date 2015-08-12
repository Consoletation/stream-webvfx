var THREE = require('three');
require('imports?THREE=three!../../libs/shaders/CopyShader');
require('imports?THREE=three!../../libs/shaders/DigitalGlitch');
require('imports?THREE=three!../../libs/shaders/FilmShader');
require('imports?THREE=three!../../libs/postprocessing/EffectComposer');
require('imports?THREE=three!../../libs/postprocessing/RenderPass');
require('imports?THREE=three!../../libs/postprocessing/MaskPass');
require('imports?THREE=three!../../libs/postprocessing/ShaderPass');
require('imports?THREE=three!../../libs/postprocessing/GlitchPassCustom');
require('imports?THREE=three!../../libs/postprocessing/FilmPass');
var Pumper = require('pumper');
var Shapes = require('./shapes')

var _ift = Date.now();
var glitchTimeout;
var bassCheck = Pumper.createBand(20, 60, 127, 4 );

var colors = [0xce1748, 0x14abbe, 0xfca412];
var currentColor = 0;

var main;

var camera, scene, renderer, composer;
var shapesContainer, light;
var shapeMesh, shapeMaterial, shapeGeometry;
var shapeStrokeLine, shapeStrokeLine, shapeStrokeGeometry;
var glitchPass;

function init() {
    //Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //Create camera
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 900;

    //Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 1, 2000 );

    initShape();

    //Bring the lights
    scene.add( new THREE.AmbientLight( 0x222222 ) );
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );


    initPostProcessing();

    window.addEventListener( 'resize', onWindowResize, false );
    glitchPass.goWild = false;


    _t = _ft = _rft = Date.now();
    frame();
}

function initShape(){
    //Create shapes container
    shapesContainer = new THREE.Object3D();
    scene.add( shapesContainer );

    //Create current shape and its stroke
    var currentShape = 2;
    var shape = new THREE.Shape();
    var shapePoints = Shapes[currentShape].points;
    shapeStrokeGeometry = new THREE.Geometry( );

    //Get shape's points from the shapes file
    shape.moveTo( shapePoints[0].x, shapePoints[0].y );
    shapeStrokeGeometry.vertices.push( new THREE.Vector3( shapePoints[0].x, shapePoints[0].y, 0) );
    for (var i = 1 ; i < shapePoints.length ; i ++){
        shape.lineTo( shapePoints[i].x, shapePoints[i].y );
        shapeStrokeGeometry.vertices.push( new THREE.Vector3( shapePoints[i].x, shapePoints[i].y, 0) );
    }
    shapeStrokeGeometry.vertices.push( new THREE.Vector3( shapePoints[0].x, shapePoints[0].y, 0) );

    //Create current shape
    shapeGeometry = new THREE.ShapeGeometry( shape );
    shapeMaterial = new THREE.MeshPhongMaterial( { color: colors[currentColor], shading: THREE.FlatShading } );
    shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    // shapeMesh.castShadow = true;
    // shapeMesh.receiveShadow = false;
    shapesContainer.add( shapeMesh );

    //Create stroke
    shapeStrokeMaterial = new THREE.LineBasicMaterial( {
        color: colors[currentColor], shading: THREE.FlatShading,
        opacity: 0.5, transparent: true} );
    shapeStrokeLine = new THREE.Line(shapeStrokeGeometry, shapeStrokeMaterial);
    shapeStrokeLine.scale.set(1.2, 1.2, 1.2)
    shapesContainer.add( shapeStrokeLine );
    // shapeStrokeLine.rotation.x = 10;
}

function initPostProcessing(){
    // postprocessing
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    glitchPass = new THREE.GlitchPass();
    // glitchPass.renderToScreen = true;
    composer.addPass( glitchPass );

    effectFilmPass = new THREE.FilmPass( 0.35, 0.1, 648, false );
    effectFilmPass.renderToScreen = true;
    composer.addPass( effectFilmPass );
}



function update() {
    _t = Date.now();

    Pumper.update();

    // glitchPass.goWild = Pumper.isSpiking;
    // glitchPass.goWild = bassCheck.isSpiking;

    // if(bassCheck.isSpiking === true) {
    if(Pumper.isSpiking === true) {
        var volume = Math.floor((bassCheck.volume * 0.7));
        var scale = 0.9 + (volume * 0.1);

        if(glitchPass.goWild === false){
            currentColor ++;
            if(currentColor > colors.length - 1){
                currentColor = 0;
            }
            shapeMaterial.color.setHex( colors[currentColor] );
            shapeStrokeMaterial.color.setHex( colors[currentColor] );
            // glitchPass.goWild = bassCheck.isSpiking;
            glitchPass.goWild = Pumper.isSpiking;
            glitchTimeout = setTimeout(function (){
                if(Pumper.isSpiking === false){
                    glitchPass.goWild = false;
                }
            }, volume)
        }else{
            clearTimeout( glitchTimeout )
            glitchTimeout = setTimeout(function (){
                if(Pumper.isSpiking === false){
                    glitchPass.goWild = false;
                }
            }, volume)
        }
    }
    scale = Pumper.volume * 0.002 + 1;
    shapeMesh.scale.set(scale, scale, scale);
    setTimeout(function (){
        shapeStrokeLine.scale.set(scale + 0.1, scale + 0.1, scale + 0.1);
    }, 10)
}

function render() {
    var time = Date.now();
    composer.render();
}

function frame() {
    requestAnimationFrame(frame);
    update();
    render();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}





var BeatProcessing = {
    init: init
};

module.exports = BeatProcessing;
