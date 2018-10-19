'use strict';

var CHANNELS = [
    'algoviz',
    'beatprocessing',
    'mosaic',
    'dirtygif',
    'reactivelogo',
    'timetraveller'
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
    },
    module: {
        loaders: [
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl'
            }
        ]
    }
};