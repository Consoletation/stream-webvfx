var THREE = require('three');
require('imports?THREE=three!../../../libs/shaders/CopyShader');
require('imports?THREE=three!../../../libs/shaders/DigitalGlitch');
require('imports?THREE=three!../../../libs/postprocessing/EffectComposer');
require('imports?THREE=three!../../../libs/postprocessing/RenderPass');
require('imports?THREE=three!../../../libs/postprocessing/MaskPass');
require('imports?THREE=three!../../../libs/postprocessing/ShaderPass');
require('imports?THREE=three!../../../libs/postprocessing/GlitchPassCustom');
var Pumper = require('pumper');

var _ift = Date.now();
var glitchTimeout;
var bassCheck = Pumper.createBand(20, 60, 127, 8 );

var INVERT_INTERVAL = 1000 / 100;


var main;

var camera, scene, renderer, composer;
var object, light;

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

    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
    var gl = new THREE.ExtrudeGeometry(ls, { amount: sr * 2, bevelEnabled: false }),
    RehabCross = new THREE.Mesh(gl, material);
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
	glitchPass.renderToScreen = true;
	composer.addPass( glitchPass );

	window.addEventListener( 'resize', onWindowResize, false );
    glitchPass.goWild = false;
}

function update(_t) {
        Pumper.update();


        // glitchPass.goWild = Pumper.isSpiking;
        // glitchPass.goWild = bassCheck.isSpiking;

        if(bassCheck.isSpiking === true) {
            var scale = 50 + Math.floor((bassCheck.volume / 255) * 400);
            console.log(scale);

            if(glitchPass.goWild === false){
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
