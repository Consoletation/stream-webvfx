console.log('DIRTY!');

var MAX_GIF_ID = 17,
    CHANGE_TIME = 5000;

function getRndInt(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min;
};

var els = {};
['fg','bg'].forEach(function(id) {
    els[id] = document.getElementById(id);
});

function set(id, imgNo) {
    els[id].style.backgroundImage = 'url(./gifs/' + imgNo + '.gif)';
}

function randomize() {
    var f = b = 0;
    while(f === b) {
        f = getRndInt(0, MAX_GIF_ID);
        b = getRndInt(0, MAX_GIF_ID);
    }
    set('fg', f);
    set('bg', b);
}

setInterval(function() {
    randomize();
}, CHANGE_TIME);

randomize();


