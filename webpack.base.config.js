const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const htmlPluginOptions = {
  hash: true,
  minify: false
}

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
}
