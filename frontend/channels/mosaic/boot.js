/* global $ */
'use strict';

var Mosaic = require('./mosaic');

function start() {
    $.get('../../assets/faces.json', function(faces) {
        $.get('../../assets/faces/players/index.json', function(players) {
            var mosaic = new Mosaic(players, faces);
            console.log('Started mosaic:', mosaic);
        });
    });
}

start();
