var Scene = require('./components/scene');


function init() {
    Scene.init();
    frame();
}

function update() {
    Scene.update();
}

function render() {
    Scene.render();
}

function frame() {
    requestAnimationFrame(frame);
    update();
    render();
}

var SplashLogo = {
    init: init
}

module.exports = SplashLogo;