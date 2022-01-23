const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const handlebars = require('handlebars');
const lang = require('./en');
const modal = require('./views/modal.handlebars');
const story = require('./views/story.handlebars');

handlebars.registerPartial({
  story,
  modal,
});

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        exclude: /node_modules/i,
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-transform-runtime',
            ]
          }
        }
      },
      {
        test: /\.(jpg|jpeg|png|svg|mp3|ogg|wav|json)/i,
        use: [
          {
            loader: 'file-loader',
          }
        ],
      },
      {
        test: /\.handlebars$/i,
        use: [
          {
            loader: 'handlebars-loader',
          },
        ],
      },
    ]
  },
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'none',
  devtool: process.env.NODE_ENV === 'dev' ? 'inline-cheap-source-map' : undefined,
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
      lang: JSON.stringify(lang),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    }),
    new htmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, 'index.handlebars'),
      templateParameters: require('./en'),
    }),
    new copyWebpackPlugin({
      patterns: [
        { 
          from: path.resolve(__dirname, 'static'), 
          to: path.resolve(__dirname, 'build/static'), 
        },
        './manifest.json',
        './index.css',
        './service-worker.js'
      ]
    }),
  ],
  optimization: process.env.NODE_ENV === 'prod' ? {
    minimize: true,
  } : undefined,
  devServer: process.env.NODE_ENV === 'dev' ? {
    publicPath: '/',
    compress: true,
    port: 3000,
    // host: '127.0.0.1',
    writeToDisk: true,
  } : undefined,
}