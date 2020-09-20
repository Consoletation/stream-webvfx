'use strict';

var glob = require('glob');

// Get all valid channels
var CHANNELS = glob.sync("channels/**/boot.js").map(path => path.split('/')[1])
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
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                    'glslify-loader'
                ]
            }
        ]
    }
};
