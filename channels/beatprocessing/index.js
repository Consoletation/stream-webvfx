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

require('gsap');


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
var currentShape = 0;
var glitchPass;

function init() {
    //Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.domElement.addEventListener('click', simulateBeat);

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
    var shapeStaticPoints = Shapes[currentShape].points;
    shapePoints = [];
    //Get shape's points from the shapes file
    for (var i = 0 ; i < shapeStaticPoints.length ; i ++){
        shapePoints.push( new THREE.Vector3( shapeStaticPoints[i].x, shapeStaticPoints[i].y, 0) );
    }

    //Create current shape
    shape = new THREE.Shape( shapePoints );
	shapeStrokeGeometry = shape.createPointsGeometry();
	var spacedPoints = shape.createSpacedPointsGeometry( 50 );
    console.log(spacedPoints);


	shapeGeometry = new THREE.ShapeGeometry( shape );
    shapeGeometry.vertices.push( new THREE.Vector3( shapeStaticPoints[0].x, shapeStaticPoints[0].y, 0) );
    shapeMaterial = new THREE.MeshPhongMaterial( { color: colors[currentColor], shading: THREE.FlatShading } );
	shapeMesh = new THREE.Mesh( shapeGeometry, shapeMaterial );
    shapesContainer.add( shapeMesh );



    //Create stroke
    shapeStrokeMaterial = new THREE.LineBasicMaterial( {
        color: colors[currentColor], shading: THREE.FlatShading,
        opacity: 0.5, transparent: true} );
    shapeStrokeLine = new THREE.Line(shapeStrokeGeometry, shapeStrokeMaterial);
    shapeStrokeLine.scale.set(1.2, 1.2, 1.2)
    shapesContainer.add( shapeStrokeLine );
    // shapeStrokeLine.rotation.x = 10;

        console.log('shapeGeometry.vertices: ', shapeGeometry.vertices);
        console.log('shapeStrokeGeometry.vertices: ', shapeStrokeGeometry.vertices);
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


function simulateBeat(){
    glitchPass.goWild = true;
    setTimeout(function (){
        glitchPass.goWild = false;
    }, 300)

    tweenVertices(0.5);
}

function tweenVertices(duration){
    currentColor ++;
    if(currentColor > colors.length - 1){
        currentColor = 0;
    }
    shapeMaterial.color.setHex( colors[currentColor] );
    shapeStrokeMaterial.color.setHex( colors[currentColor] );

    console.log(duration);
    currentShape ++ ;
    if( currentShape >= Shapes.length ){
        currentShape = 0;
    }
    var shapeStaticPoints = Shapes[currentShape].points;
    shapePoints = [];
    //Get shape's points from the shapes file
    for (var i = 0 ; i < shapeStaticPoints.length ; i ++){
        shapePoints.push( new THREE.Vector3( shapeStaticPoints[i].x, shapeStaticPoints[i].y, 0) );
    }
    shapePoints.push( new THREE.Vector3( shapeStaticPoints[0].x, shapeStaticPoints[0].y, 0) );

    //Tween vertices
    for (var i = 0 ; i < shapePoints.length ; i ++){
        TweenMax.to(shapeGeometry.vertices[i], duration, {
            x: shapePoints[i].x,
            y: shapePoints[i].y,
            delay: 0,
            ease: Cubic.easeInOut
        })
        TweenMax.to(shapeStrokeGeometry.vertices[i], duration + 0.05, {
            x: shapePoints[i].x,
            y: shapePoints[i].y,
            delay: 0,
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

    // glitchPass.goWild = Pumper.isSpiking;
    // glitchPass.goWild = bassCheck.isSpiking;

    // if(bassCheck.isSpiking === true) {
    if(Pumper.isSpiking === true) {
        var volume = Math.floor((bassCheck.volume * 0.7));
        var scale = 0.9 + (volume * 0.1);

            tweenVertices(scale * 0.02);

        if(glitchPass.goWild === false){
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
