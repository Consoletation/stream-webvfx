module.exports = {
    entry: {
        main: './main.js',
        mosaic: './mosaic.js'
    },
    output: {
        path: __dirname,
        filename: '[name].bundle.js'
    },
    resolve: {
        alias: {
            'pumper': __dirname + '/core/audio'
        }
    }
};
