var THREE = require('three'),
    RehabCross = require('./rehabcross');

var w, h;
var _t, _ft;
var scene, camera, renderer, floor, ambLight, spotlight;

var COLORS = {
    bg: 0xefefef,
    text: 0x222222,
    red: 0xce1748,
    blue: 0x14abbe,
    yellow: 0xfca412,
    logo: 0xffffff
};

var CAMERA_RADIUS = 300,
    FLICKER_TIME = 100;

function toRad(angle) {
    return angle * Math.PI / 180;
}

function _onResize() {
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
}

function init() {
    w = window.innerWidth;
    h = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 2000);
    camera.position.z = 600;
    camera.position.y = 400;
    scene.add(camera);
    scene.fog = new THREE.Fog( COLORS.bg, 800, 2000 );

    var ambLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambLight);

    spotlight = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
    spotlight.position.set( 500, 1500, 1000 );
    spotlight.target.position.set( 0, 0, 0 );
    spotlight.castShadow = true;
    spotlight.shadowCameraNear = 1200;
    spotlight.shadowCameraFar = 2500;
    spotlight.shadowCameraFov = 50;
    //spotlight.shadowCameraVisible = true;
    spotlight.shadowBias = 0.0001;
    spotlight.shadowDarkness = 0.4;
    spotlight.shadowMapWidth = 2048;
    spotlight.shadowMapHeight = 2048;
    scene.add(spotlight);

    // Create floor
    var gf = new THREE.PlaneGeometry(4000, 4000, 20, 20),
        mf = new THREE.MeshPhongMaterial({
            color: COLORS.bg,
            shininess: 0,
            specular: 0,
            shading: THREE.SmoothShading
        });
    floor = new THREE.Mesh(gf, mf);
    floor.rotation.x = toRad(-90);
    floor.castShadow = false;
    floor.receiveShadow = true;
    scene.add(floor);

    scene.add(RehabCross);

    // TODO: add text
    // TODO: add artifacts
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor( COLORS.bg );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;

    // append el to body
    document.body.appendChild(renderer.domElement);

    // Setup resize handler
    window.addEventListener('resize', _onResize, false);

    _t = _ft = Date.now();
}

function update() {
    _t = Date.now();
    var timer = 0.001 * _t;

    // move spotlight
    spotlight.position.x = 500 + Math.sin(timer * 0.1) * 300;

    // move camera
    camera.position.x = Math.cos(timer * 0.23) * 500;
    camera.position.y = 400 + Math.sin(timer * 0.2) * 200;
    camera.position.z = 400 + Math.sin(timer * 0.1) * 100;
    camera.lookAt(RehabCross.position);

    // update logo color
    // TODO: map & update logo image
    if(_t - _ft > FLICKER_TIME) {
        _ft = _t;
        RehabCross.__doRndColor();
    }
}

function render() {
    renderer.render(scene, camera);
}

var Scene = {
    init: init,
    update: update,
    render: render
};

module.exports = Scene;

