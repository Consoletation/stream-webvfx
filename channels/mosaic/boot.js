'use strict';

var Mosaic = require('./mosaic');

function fetch(url, cb) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            cb(JSON.parse(request.responseText));
        }
    };

    request.open('GET', url);
    request.send();
}

function start() {
    fetch('../../assets/faces.json', function(faces) {
        fetch('../../assets/faces/players/players.json', function(players) {
            var mosaic = new Mosaic(players, faces);
            console.log('Started mosaic:', mosaic);
        });
    });
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            var data = JSON.parse(request.responseText);
        }
    };

    request.open('GET', '../../assets/faces.json');
    request.send();
}

start();
