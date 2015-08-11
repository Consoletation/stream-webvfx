var THREE = require('three');
require('imports?THREE=three!../../../libs/shaders/CopyShader');
require('imports?THREE=three!../../../libs/shaders/DigitalGlitch');
require('imports?THREE=three!../../../libs/postprocessing/EffectComposer');
require('imports?THREE=three!../../../libs/postprocessing/RenderPass');
require('imports?THREE=three!../../../libs/postprocessing/MaskPass');
require('imports?THREE=three!../../../libs/postprocessing/ShaderPass');
require('imports?THREE=three!../../../libs/postprocessing/GlitchPassCustom');



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

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 400;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

	object = new THREE.Object3D();
	scene.add( object );

	var geometry = new THREE.SphereGeometry( 1, 4, 4 );
	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );

	for ( var i = 0; i < 10; i ++ ) {
		material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random(), shading: THREE.FlatShading } );

		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
		mesh.position.multiplyScalar( Math.random() * 400 );
		mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
		object.add( mesh );

	}

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
    setInterval(function(){
        glitchPass.goWild = true;
        setTimeout(function (){
            glitchPass.goWild = false;
        }, 200)
    }, 1000)
}

function update(_t) {
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
