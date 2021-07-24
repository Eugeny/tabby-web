const path = require('path')
const webpack = require('webpack')
const { AngularWebpackPlugin } =  require('@ngtools/webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin


const htmlPluginOptions = {
  hash: true,
  minify: false
}

const baseConfig = {
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

module.exports = [
  {
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
    ],
    output: {
      path: path.join(__dirname, 'build'),
      pathinfo: true,
      publicPath: '/static/',
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
    },
  },
  {
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
  },
]

if (process.env.BUNDLE_ANALYZER) {
  module.exports[0].plugins.push(new BundleAnalyzerPlugin())
}
