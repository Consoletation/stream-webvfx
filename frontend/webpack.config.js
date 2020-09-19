'use strict';

var CHANNELS = [
    'bp-stealthct',
    'ct-logo',
    'ct-logo-trans',
    'ct-logo-trans-corner',
    'doom-three',
    'wwf',
    'wwf-webmidi'
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
        rules: [
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl'
            }
        ]
    }
};
