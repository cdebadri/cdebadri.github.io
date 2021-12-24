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
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js',
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-nullish-coalescing-operator'
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
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
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
      lang: JSON.stringify(lang),
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
      ]
    }),
  ],
  devServer: {
    publicPath: '/',
    compress: true,
    port: 3000,
    host: '192.168.0.104',
  },
}