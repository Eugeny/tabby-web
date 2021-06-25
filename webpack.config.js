const path = require('path')
const webpack = require('webpack')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')

module.exports = {
  target: 'web',
  entry: {
    'index.ignore': 'file-loader?name=index.html!pug-html-loader!' + path.resolve(__dirname, './src/index.pug'),
    index: path.resolve(__dirname, 'src/index.ts'),
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
      { test: /terminus\/app\/dist/, use: ['script-loader'] },
      {
        test: /\.pug$/,
        use: ['apply-loader', 'pug-loader'],
        include: /component\.pug/
      },
      {
        test: /\.scss$/,
        use: ['@terminus-term/to-string-loader', 'css-loader', 'sass-loader'],
        include: /component\.scss/
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: /component\.scss/
      },
      {
        test: /\.(ttf|eot|otf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        type: 'asset/resource',
      },
      { test: /\.css$/, use: ['css-loader', 'sass-loader'] },
      {
        test: /\.(jpeg|png|svg)?$/,
        type: 'asset/resource',
      }
    ],
  },

  plugins: [
    new AngularWebpackPlugin({
      tsconfig: 'tsconfig.main.json',
      directTemplateLoading: false,
    }),
  ],
}
