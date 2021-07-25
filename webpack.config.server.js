const baseConfig = require('./webpack.config.base.js')
const path = require('path')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')
const nodeExternals = require('webpack-node-externals')

const outputPath = path.join(__dirname, 'build-server')

module.exports = {
    name: 'server',
    target: 'node',
    ...baseConfig,
    entry: {
        // 'index.server': path.resolve(__dirname, 'src/index.server.ts'),
        'server': path.resolve(__dirname, 'src/server.ts'),
    },
    resolve: {
      ...baseConfig.resolve,
      mainFields: ['esm2015', 'module', 'main'],
    },
    plugins: [
        ...baseConfig.plugins,
        new AngularWebpackPlugin({
            entryModule: path.resolve(__dirname, 'src/app.server.module#AppServerModule'),
            mainPath: path.resolve(__dirname, 'src/server.ts'),
            tsconfig: 'tsconfig.json',
            directTemplateLoading: false,
            platform: 1,
            skipCodeGeneration: false,
        }),
    ],
    output: {
        // libraryTarget: 'commonjs',
        path: outputPath,
        pathinfo: true,
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
    },
}
