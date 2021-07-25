const baseConfig = require('./webpack.config.base.js')
const fs = require('fs')
const path = require('path')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const HtmlWebpackPlugin = require('html-webpack-plugin')

const htmlPluginOptions = {
  hash: true,
  minify: false
}

const outputPath = path.join(__dirname, 'build')
const backendURL = process.env.BACKEND_URL
if (!backendURL) {
  throw new Error('BACKEND_URL env var is required')
}

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
        skipCodeGeneration: false,
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
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', _ => {
          fs.writeFileSync(path.join(outputPath, 'config.json'), JSON.stringify({
            backendURL,
          }))
        })
      },
    },
  ],
  output: {
    path: outputPath,
    pathinfo: true,
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
  },
}

if (process.env.BUNDLE_ANALYZER) {
  module.exports[0].plugins.push(new BundleAnalyzerPlugin())
}
