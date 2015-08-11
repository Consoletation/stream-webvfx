var THREE = require('three');
require('imports?THREE=three!../../../libs/shaders/CopyShader');
require('imports?THREE=three!../../../libs/shaders/DigitalGlitch');
require('imports?THREE=three!../../../libs/shaders/FilmShader');
require('imports?THREE=three!../../../libs/postprocessing/EffectComposer');
require('imports?THREE=three!../../../libs/postprocessing/RenderPass');
require('imports?THREE=three!../../../libs/postprocessing/MaskPass');
require('imports?THREE=three!../../../libs/postprocessing/ShaderPass');
require('imports?THREE=three!../../../libs/postprocessing/GlitchPassCustom');
require('imports?THREE=three!../../../libs/postprocessing/FilmPass');
var Pumper = require('pumper');

var _ift = Date.now();
var glitchTimeout;
var bassCheck = Pumper.createBand(20, 60, 127, 8 );

var INVERT_INTERVAL = 1000 / 100;
var colors = [0xce1748, 0x14abbe, 0xfca412];
var currentColor = 0;

var main;

var camera, scene, renderer, composer;
var object, light;
var RehabCross, RehabCrossMaterial;
var glitchPass;


function setup(mainConfig) {
    main = mainConfig;

    renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 900;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 2000 );

	object = new THREE.Object3D();
	scene.add( object );



    var lr = 200, sr = 50;
    var ls = new THREE.Shape();

    ls.moveTo( -sr, lr );
    ls.lineTo( sr, lr );
    ls.lineTo( sr, sr );
    ls.lineTo( lr, sr );
    ls.lineTo( lr, -sr );
    ls.lineTo( sr, -sr );
    ls.lineTo( sr, -lr );
    ls.lineTo( -sr, -lr );
    ls.lineTo( -sr, -sr );
    ls.lineTo( -lr, -sr );
    ls.lineTo( -lr, sr );
    ls.lineTo( -sr, sr );

    RehabCrossMaterial = new THREE.MeshPhongMaterial( { color: colors[currentColor], shading: THREE.FlatShading } );
    var gl = new THREE.ExtrudeGeometry(ls, { amount: sr * 2, bevelEnabled: false }),
    RehabCross = new THREE.Mesh(gl, RehabCrossMaterial);
    RehabCross.castShadow = true;
    RehabCross.receiveShadow = false;
    RehabCross.position.y = 400;

    object.add( RehabCross );


	scene.add( new THREE.AmbientLight( 0x222222 ) );

	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	// postprocessing

	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );

	glitchPass = new THREE.GlitchPass();
	// glitchPass.renderToScreen = true;
	composer.addPass( glitchPass );

    effectFilmPass = new THREE.FilmPass( 0.35, 0.1, 648, false );
	effectFilmPass.renderToScreen = true;
    composer.addPass( effectFilmPass );

	window.addEventListener( 'resize', onWindowResize, false );
    glitchPass.goWild = false;
}

function update(_t) {
        Pumper.update();


        // glitchPass.goWild = Pumper.isSpiking;
        // glitchPass.goWild = bassCheck.isSpiking;

        if(bassCheck.isSpiking === true) {
            var scale =Math.floor((bassCheck.volume / 255) * 400);

            if(glitchPass.goWild === false){
                currentColor ++;
                if(currentColor > colors.length - 1){
                    currentColor = 0;
                }
                RehabCrossMaterial.color.setHex( colors[currentColor] );
                glitchPass.goWild = bassCheck.isSpiking;
                glitchTimeout = setTimeout(function (){
                    glitchPass.goWild = false;
                }, scale)
            }else{
                clearTimeout( glitchTimeout )
                glitchTimeout = setTimeout(function (){
                    glitchPass.goWild = false;
                }, scale)
            }
        }
}



function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function render(_t) {
    var time = Date.now();
    object.rotation.x += 0.005;
    object.rotation.y += 0.01;
    composer.render();
}


var Shapes = {
    setup: setup,
    update: update,
    render: render
};

module.exports = Shapes;
