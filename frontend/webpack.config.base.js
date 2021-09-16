require('dotenv').config({path: '../.env'})
const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports  = {
  mode: process.env.DEV ? 'development' : 'production',
  context: __dirname,
  devtool: 'source-map',
  cache: !process.env.DEV ? false : {
    type: 'filesystem',
  },
  resolve: {
    mainFields: ['esm2015', 'browser', 'module', 'main'],
    modules: [
      'src/',
      'node_modules/',
    ],
    extensions: ['.ts', '.js'],
    alias: {
        assets: path.resolve(__dirname, 'assets'),
        src: path.resolve(__dirname, 'src'),
        theme: path.resolve(__dirname, 'theme'),
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: '@ngtools/webpack',
      },
      { test: /tabby\/app\/dist/, use: ['script-loader'] },
      {
        test: /\.pug$/,
        use: ['apply-loader', 'pug-loader'],
        include: /component\.pug/
      },
      {
        test: /\.scss$/,
        use: ['@tabby-gang/to-string-loader', 'css-loader', 'sass-loader'],
        include: /component\.scss/
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /component\.scss/
      },
      {
        test: /\.(ttf|eot|otf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
      },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
      {
        test: /\.(jpeg|png|svg)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
        BACKEND_URL: JSON.stringify(process.env.BACKEND_URL || ''),
    }),
  ],
}
