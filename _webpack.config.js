var webpack;

webpack = require('webpack');

var env = process.env.NODE_ENV || "development";
console.log("Node env is: " + env);

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'jquery': path.join(__dirname, '/node_modules/jquery/dist/jquery.js'),
      'jquery.validate': path.join(__dirname, '/public/vendor/jquery.validate.min.js'),
      'jquery.validate.de': path.join(__dirname, '/assets/vendor/jquery.validate.de.js'),
      'jquery-ui': path.join(__dirname, '/public/js/vendor/jquery-ui.min'),
      'cookies': path.join(__dirname, '/assets/js/js.cookie'),
      'lightbox': path.join(__dirname, '/bower_components/lightbox2/dist/js/lightbox.min.js'),
      'jquery.datepicker': path.join(__dirname, '/assets/vendor/jquery.datepicker/datepicker.min.js'),
      'jquery.fileupload': path.join(__dirname, '/public/vendor/jquery.fileupload'),
      'jquery.ui.widget': path.join(__dirname, '/public/vendor/jquery.ui.widget'),
      'datepicker': path.join(__dirname, '/assets/vendor/datepicker/dist/datepicker.js')
    }
  },
  entry: {
    'default': './assets/js/default',
    'galery-cat': './assets/js/galery-cat',
    'galery': './assets/js/galery',
    'home': './assets/js/home',
    'admin/list-galeries': './assets/js/admin/list_galeries',
    'admin/modify-galery': './assets/js/admin/modify_galery',
    'admin/new-galery': './assets/js/admin/new_galery',
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: "[name].bundle.js",
    publicPath: "/assets/",
    chunkFilename: "[id].chunk.js"
  },
  module: {
    rules: [
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    },
    {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    },
    {test:/\.gif$/,loader:'url-loader'},
    {test:/\.png$/,loader:'url-loader'},
    {test:/\.cur/,loader:'url-loader'},
    {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader"),
    },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
    ]
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }  
    }
  },

  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),  
    new ExtractTextPlugin({
      filename: "[name].css",
    }),
    //new optimization.splitChunks({
    //  filename: "admin/common.js",
    //  name: "admin/common",
    //  chunks: ['admin/list-galeries', 'admin/modify-galery', 'admin/new-galery'],
    //}),
    //new optimization.splitChunks({
    //  filename: "common.js",
    //  name: "common",
    //  chunks: ['default', 'home', 'galery-cat', 'galery'],
    //})
  ]
};
