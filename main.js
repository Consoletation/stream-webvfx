/* global $ */

'use strict';

console.log('loaded');

var CHANNELS = {
    'algoviz': {
        author: 'Neil',
        duration: 10
    },
    'beatprocessing': {
        author: 'Mick',
        duration: 10
    },
    'mosaic': {
        author: 'Grieve',
        duration: 20
    },
    'dirtygif': {
        author: 'Neil',
        duration: 10
    },
    'reactivelogo': {
        author: 'Pedro',
        duration: 20
    }
};

var CHANNEL_IDS = Object.keys(CHANNELS),
    DEFAULT_CHANNEL_DURATION = 10,
    OSD_HANG_TIME = 2000;

var currentChannel = null,
    nextChannel = null,
    autoRandom = true;



function getURLParam(name, url) {
    if (!url) url = location.href
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}

function getRndInt(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min;
}

function getEl(id) {
    return document.getElementById(id);
}

var els = {
    osd: getEl('osd'),
    channelName: getEl('channel-name'),
    channelAuthor: getEl('channel-author'),
    mainframe: getEl('mainframe'),
    instructions: getEl('instructions'),
    channelList: getEl('channel-list')
};

CHANNEL_IDS.forEach(function(name, idx) {
    var item = document.createElement('p');
    item.textContent = (idx + 1) + ' - ' + name;
    els.channelList.appendChild(item);
});

var _ti;

function changeChannel(id) {
    console.log('change channel', id);
    var ipt = getURLParam('input');
    console.log('URL PARAM', ipt);
    var inputAppend = (ipt !== null) ? '?input=' + ipt : '';

    var src = (id === null) ? '' : './channels/' + id + inputAppend;
    els.mainframe.setAttribute('src', src);
    currentChannel = id;

    var name;
    var author;

    if (currentChannel) {
        name = id;
        author = CHANNELS[currentChannel].author;
    } else {
        name = 'RHB';
        author = '...';
    }

    clearTimeout(_ti);
    els.channelName.textContent = name;
    els.channelAuthor.textContent = author;
    els.osd.classList.add('visible');
    setTimeout(function() {
        els.osd.classList.remove('visible');
    }, OSD_HANG_TIME);
}

function changeRandomChannel() {
    var cid = CHANNEL_IDS[getRndInt(0, CHANNEL_IDS.length - 1)];
    changeChannel(cid);
}

var _ti;
function timedChangeRandom() {
    
    if(autoRandom == false) return false;

    var nid = currentChannel;
    while(nid === currentChannel) {
        nid = CHANNEL_IDS[getRndInt(0, CHANNEL_IDS.length - 1)];
    }

    _ti = setTimeout(function() {
        changeChannel(nid);
        timedChangeRandom();
    }, (CHANNELS[nid].duration || DEFAULT_CHANNEL_DURATION) * 1000);
}

function enableAutoRandom() {
    changeRandomChannel();
    timedChangeRandom();
    autoRandom = true;
    console.log('autoRandom on');
}

function disableAutoRandom() {
    clearInterval(_ti);
    autoRandom = false;
    console.log('autoRandom off');
}

$(document).on('keypress', function(e) {
    var k = e.which || e.keyCode;
    var nk = k - 48;
    console.log('keypress', k, nk);

    if (nk >= 0 && nk <= CHANNEL_IDS.length) {
        disableAutoRandom();
        var cid = (nk) ? CHANNEL_IDS[nk - 1] : null;
        changeChannel(cid);
    }

    if (k == 82) { // R
        if(autoRandom) {
            disableAutoRandom();
        } else {
            enableAutoRandom();
        }
    }
});

setTimeout(function() {
    els.instructions.classList.remove('visible');
    enableAutoRandom();
}, 6000);

