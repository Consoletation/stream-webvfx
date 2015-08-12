var CHANNELS = [
    'algoviz',
    'beatprocessing',
    //'reactivelogo',
    //'splashlogo',
    //'test'
];

var _entries = {};

CHANNELS.forEach(function(c) {
    _entries[c] = './channels/' + c + '/boot.js';
});

console.log('ENTRIES', _entries);

module.exports = {
    entry: _entries,
    output: {
        path: __dirname,
        filename: './channels/[name]/[name].bundle.js'
    },
    resolve: {
        alias: {
            'pumper': __dirname + '/core/audio'
        }
    }
};
