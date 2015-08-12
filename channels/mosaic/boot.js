'use strict';

var Mosaic = require('./mosaic');

function start() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var data = JSON.parse(request.responseText);
            var mosaic = new Mosaic('../../assets/test_mosaic.png', data);
            console.log('Started mosaic:', mosaic);
        }
    };

    request.open('GET', '../../assets/faces.json');
    request.send();
}

start();
