/* global $ */
'use strict';

console.log('DIRTY!');

var CHANGE_TIME = 5000;
var GIFS = [];

function getRndInt(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min;
}

var els = {};
['fg','bg'].forEach(function(id) {
    els[id] = document.getElementById(id);
});

function set(id, imgNo) {
    els[id].style.backgroundImage = 'url(../../assets/gifs/' + GIFS[imgNo] + ')';
}

function randomize() {
    var f = 0;
    var b = 0;
    while (f === b) {
        f = getRndInt(0, GIFS.length);
        b = getRndInt(0, GIFS.length);
    }
    set('fg', f);
    set('bg', b);
}

setInterval(function() {
    randomize();
}, CHANGE_TIME);

$.get('../../assets/gifs/index.json', function(response) {
    GIFS = response;
    randomize();
});
