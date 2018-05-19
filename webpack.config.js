var webpack;

webpack = require('webpack');

var env = process.env.NODE_ENV || "development";
console.log("Node env is: " + env);

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'jquery': path.join(__dirname, '/node_modules/jquery/dist/jquery.js'),
      'jquery.validate': path.join(__dirname, '/public/vendor/jquery.validate.min.js'),
      'jquery.validate.de': path.join(__dirname, '/src/assets/vendor/jquery.validate.de.js'),
      'jquery-ui': path.join(__dirname, '/public/js/vendor/jquery-ui.min'),
      'cookies': path.join(__dirname, '/src/assets/js/js.cookie'),
      'lightbox': path.join(__dirname, '/bower_components/lightbox2/dist/js/lightbox.min.js'),
      'jquery.datepicker': path.join(__dirname, '/src/assets/vendor/jquery.datepicker/datepicker.min.js'),
      'datepicker': path.join(__dirname, 'src/assets/vendor/datepicker/dist/datepicker.js'),
      'jquery.fileupload': path.join(__dirname, '/public/vendor/jquery.fileupload'),
      'jquery.ui.widget': path.join(__dirname, '/public/vendor/jquery.ui.widget'),
    }
  },
  entry: {
    'default': './src/assets/js/default',
    'galery-cat': './src/assets/js/galery-cat',
    'galery': './src/assets/js/galery',
    'home': './src/assets/js/home',
    'admin/list-galeries': './src/assets/js/admin/list_galeries',
    'admin/modify-galery': './src/assets/js/admin/modify_galery',
    'admin/new-galery': './src/assets/js/admin/new_galery',
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
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.less$/,
        use:  [  'style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      },
      // {
      //   test: /\.less$/,
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: 'css-loader!less-loader'
      //   }),
      // },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        'admin' : {
          test: '/admin/',
          name: "admin",
          minChunks: 2,
        }
      }
    },
  },
  plugins: [
    //new ExtractTextPlugin({
    //  // Options similar to the same options in webpackOptions.output
    //  // both options are optional
    //  filename: "[name].css",
    //}),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   filename: "admin/common.js",
    //   name: "admin/common",
    //   chunks: ['admin/list-galeries', 'admin/modify-galery', 'admin/new-galery'],
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   filename: "common.js",
    //   name: "common",
    //   chunks: ,
    // })
  ]
};
