var THREE = require('three');

var COLOR_INIT = 0xff0000,
    color = new THREE.Color(COLOR_INIT);

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

var gl = new THREE.ExtrudeGeometry(ls, { amount: sr * 2, bevelEnabled: false }),
    ml = new THREE.MeshPhongMaterial({
        color: color,
        ambient: color
    });

RehabCross = new THREE.Mesh(gl, ml);
RehabCross.castShadow = true;
RehabCross.receiveShadow = false;
RehabCross.position.y = 400;

var logoLight = new THREE.PointLight(color, 0.6, 700);
RehabCross.add(logoLight);

console.log('RehabCross', RehabCross);

RehabCross.__doRndColor = function() {
    color.r = logoLight.color.r = Math.random();
    color.g = logoLight.color.g = Math.random();
    color.b = logoLight.color.b = Math.random();
    RehabCross.material.ambient = RehabCross.material.color = color;
}

module.exports = RehabCross;