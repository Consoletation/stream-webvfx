console.log('loaded');

var CHANNELS = {
    'algoviz' : {
        author: 'Neil'
    }
}


var currentChannel = null;

function getEl(id) {
    return document.getElementById(id);
}

var els = {
    osd: getEl('osd'),
    channelName: getEl('channel-name'),
    channelAuthor: getEl('channel-author'),
    mainframe: getEl('mainframe')
};

function changeChannel(id) {
    console.log('change channel', id);
    var src = (id === null) ? '' : './channels/' + id;
    els.mainframe.setAttribute('src', src);
    cuurentChannel = id;
}


setTimeout(function() {
    changeChannel('algoviz');
}, 4000);



