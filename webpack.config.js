const path = require('path')
const webpack = require('webpack')

module.exports = {
  target: 'web',
  entry: {
    'index.ignore': 'file-loader?name=../index.html!pug-html-loader!' + path.resolve(__dirname, './index.pug'),
    'terminal.ignore': 'file-loader?name=terminal.html!pug-html-loader!' + path.resolve(__dirname, './terminal.pug'),
    index: path.resolve(__dirname, 'index.ts'),
    terminal: path.resolve(__dirname, 'terminal.ts'),
  },
  mode: process.env.TERMINUS_DEV ? 'development' : 'production',
  context: __dirname,
  devtool: 'cheap-module-source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    pathinfo: true,
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
  },
  resolve: {
    modules: [
      ...[
        '../terminus/terminus-core/node_modules/',
        '../terminus/terminus-settings/node_modules/',
        '../terminus/terminus-terminal/node_modules/',
        '../terminus/node_modules',
        '../terminus/app/node_modules',
        '../terminus/app/assets/',
      ].map(x => path.join(__dirname, x)),
      'node_modules/',
    ],
    extensions: ['.ts', '.js'],
    fallback: {
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert/'),
      constants: require.resolve('constants-browserify'),
      util: require.resolve('util/'),
    },
  },
  externals: {
    'dns': 'commonjs dns',
    'tls': 'commonjs tls',
    'tty': 'commonjs tty',
    'crypto': 'commonjs crypto',
    'querystring': 'commonjs querystring',
    'https': 'commonjs https',
    'http': 'commonjs http',
    'url': 'commonjs url',
    'zlib': 'commonjs zlib',
    '../build/Release/cpufeatures.node': 'commonjs ../build/Release/cpufeatures.node',
    './crypto/build/Release/sshcrypto.node': 'commonjs ./crypto/build/Release/sshcrypto.node',
    'terminus-core': 'commonjs terminus-core',
    'terminus-terminal': 'commonjs terminus-terminal',
    'terminus-settings': 'commonjs terminus-settings',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            configFileName: path.resolve(__dirname, 'tsconfig.json'),
          },
        },
      },
      { test: /terminus\/app\/dist/, use: ['script-loader'] },
      // { test: /dist\/index/, use: ['raw-loader'] },
      {
        test: /\.(ttf|eot|otf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]',
          },
        },
      },
      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
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


const externals = [
  '@electron/remote',
  'any-promise',
  'child_process',
  'electron-promise-ipc',
  'electron',
  'fontmanager-redux',
  'fs',
  'keytar',
  'hterm-umdjs',
  'macos-native-processlist',
  'native-process-working-directory',
  'net',
  'os',
  'path',
  'readline',
  'serialport',
  'socksv5',
  'windows-native-registry',
  'windows-process-tree',
  'windows-process-tree/build/Release/windows_process_tree.node',
]

for (const k of externals) {
  module.exports.externals[k] = `commonjs ${k}`
}
