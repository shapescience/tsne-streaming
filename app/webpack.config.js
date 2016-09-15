// http://www.pro-react.com/materials/appendixA/
var webpack = require('webpack'); // only necessary for plugins
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry:  __dirname + '/src/index.js',

  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css?modules!postcss')
      }
    ]
  },

  postcss: [
    require('autoprefixer')
  ],

  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.tmpl.html"
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin("style.css")
  ],

  devtool: 'source-map',
  devServer: {
    port: 8082,
    host: '0.0.0.0',
    colors: true,
    historyApiFallback: true,
    inline: true,
    compress: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 100 // is this the same as specifying --watch-poll?
    },
    hot: true // reloading of individual modules when they change
  }
}
