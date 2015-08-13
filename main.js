/* global $ */

'use strict';

console.log('loaded');

var CHANNELS = {
    'algoviz': {
        author: 'Neil'
    },
    'beatprocessing': {
        author: 'Mick'
    },
    'mosaic': {
        author: 'Grieve'
    },
    'dirtygif': {
        author: 'Neil'
    },
    'reactivelogo': {
        author: 'Pedro'
    }
};

var CHANNEL_IDS = Object.keys(CHANNELS);

var OSD_HANG_TIME = 2000;

var currentChannel = null;

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
    var src = (id === null) ? '' : './channels/' + id;
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

$(document).on('keypress', function(e) {
    var k = e.which || e.keyCode;
    var nk = k - 48;
    console.log('keypress', k, nk);

    if (nk >= 0 && nk <= CHANNEL_IDS.length) {
        var cid = (nk) ? CHANNEL_IDS[nk - 1] : null;
        changeChannel(cid);
    }
});

setTimeout(function() {
    els.instructions.classList.remove('visible');
}, 6000);
