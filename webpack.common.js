const glob = require('glob');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

// Get all valid channels
const CHANNELS = glob.sync("channels/**/boot.js").map(path => path.split('/')[1])
const _entries = {};
CHANNELS.forEach(function(c) {
    _entries[c] = './channels/' + c + '/boot.js';
});

console.log('ENTRIES', _entries);

module.exports = {
    entry: _entries,
    plugins: [
        new CopyPlugin({
            patterns: [
                'index.html',
                'common.css',
                'main.js',
                'assets/**/*',
                'channels/**/*.html',
            ],
        }),
    ],
    output: {
        path: path.join(__dirname, '/build'),
        filename: './channels/[name]/[name].bundle.js'
    },
    resolve: {
        alias: {
            'pumper': __dirname + '/libs/pumper'
        },
        extensions: ['.ts', '.js'],
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
            },
            {
                test: /\.(js|ts)$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ]
    },
    performance: {
        hints: false,
        maxEntrypointSize: 1024000,
        maxAssetSize: 1024000
    },
};
