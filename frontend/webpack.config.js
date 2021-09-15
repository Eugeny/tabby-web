const baseConfig = require('./webpack.config.base.js')
const path = require('path')
const webpack = require('webpack')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlPluginOptions = {
  hash: true,
  minify: false
}

const outputPath = path.join(__dirname, 'build')

module.exports = {
  name: 'browser',
  target: 'web',
  ...baseConfig,
  entry: {
    index: path.resolve(__dirname, 'src/index.ts'),
    terminal: path.resolve(__dirname, 'src/terminal.ts'),
  },
  plugins: [
    ...baseConfig.plugins,
    new AngularWebpackPlugin({
        tsconfig: 'tsconfig.json',
        directTemplateLoading: false,
        jitMode: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index'],
      ...htmlPluginOptions,
    }),
    new HtmlWebpackPlugin({
      template: './src/terminal.html',
      filename: 'terminal.html',
      chunks: ['terminal'],
      ...htmlPluginOptions,
    }),
  ],
  output: {
    path: outputPath,
    pathinfo: true,
    publicPath: '/static/',
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
  },
}

if (process.env.BUNDLE_ANALYZER) {
  module.exports.plugins.push(new BundleAnalyzerPlugin())
}
