const path = require('path')
const webpack = require('webpack')

module.exports = {
  name: 'web-container-terminal',
  target: 'web',
  entry: {
    'terminal.ignore': 'file-loader?name=terminal.html!pug-html-loader!' + path.resolve(__dirname, './src/terminal.pug'),
    terminal: path.resolve(__dirname, 'src/terminal.ts'),
  },
  mode: process.env.DEV ? 'development' : 'production',
  context: __dirname,
  devtool: 'cheap-module-source-map',
  output: {
    path: path.join(__dirname, 'build'),
    pathinfo: true,
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
  },
  resolve: {
    modules: [
      ...[
        // '../terminus/terminus-core/node_modules/',
        // '../terminus/terminus-settings/node_modules/',
        // '../terminus/terminus-terminal/node_modules/',
        // '../terminus/node_modules',
        // '../terminus/app/node_modules',
        // '../terminus/app/assets/',
        'src',
      ].map(x => path.join(__dirname, x)),
      'node_modules/',
    ],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: path.resolve(__dirname, 'tsconfig.container.json'),
          },
        },
      },
      //   { test: /terminus\/app\/dist/, use: ['script-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(ttf|eot|otf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]',
          },
        },
      },
      { test: /\.css$/, use: ['css-loader', 'sass-loader'] },
      {
        test: /\.(jpeg|png|svg)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }
      }
    ],
  }
}
