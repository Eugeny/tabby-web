const baseConfig = require('./webpack.base.config.js')
const path = require('path')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')

module.exports = {
    name: 'server',
    target: 'node',
    ...baseConfig,
    entry: {
    'index.server': path.resolve(__dirname, 'src/index.server.ts'),
    'server': path.resolve(__dirname, 'src/server.ts'),
    },
    plugins: [
    ...baseConfig.plugins,
    new AngularWebpackPlugin({
        entryModule: path.resolve(__dirname, 'src/app/app.server.module`#AppServerModule'),
        mainPath: path.resolve(__dirname, 'src/index.server.ts'),
        tsconfig: 'tsconfig.json',
        directTemplateLoading: false,
        platform: 1,
        skipCodeGeneration: false,
    }),
    ],
    output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, 'build-server'),
    pathinfo: true,
    publicPath: '/static/',
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
    },
}
