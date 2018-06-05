const webpack = require('webpack');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const path = require('path');

const plugins = [
  new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "[id].css"
  }),
];

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv !== 'production') {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  resolve: {
    alias: {
      jquery: path.join(__dirname, '/node_modules/jquery/dist/jquery.js'),
      justifiedGallery: path.join(__dirname, '/src/assets/vendor/justifiedGallery/dist/js/jquery.justifiedGallery.js'),
      'jquery.validate': path.join(__dirname, '/public/vendor/jquery.validate.min.js'),
      'jquery.validate.de': path.join(__dirname, '/src/assets/vendor/jquery.validate.de.js'),
      'jquery-ui': path.join(__dirname, '/public/js/vendor/jquery-ui.min'),
      'cookies': path.join(__dirname, '/src/assets/js/js.cookie'),
      'lightbox': path.join(__dirname, '/bower_components/lightbox2/dist/js/lightbox.min.js'),
      'jquery.datepicker': path.join(__dirname, '/src/assets/vendor/jquery.datepicker/datepicker.min.js'),
      datepicker: path.join(__dirname, 'src/assets/vendor/datepicker/dist/datepicker'),
      'jquery.fileupload': path.join(__dirname, '/public/vendor/jquery.fileupload'),
      'jquery.ui.widget': path.join(__dirname, '/public/vendor/jquery.ui.widget'),
    }
  },
  entry: {
    'def': './src/assets/js/default',
    'galery-cat': './src/assets/js/galery-cat',
    'galery': './src/assets/js/galery',
    'home': './src/assets/js/home',
    'yonny': './src/assets/js/yonny',
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
      { test: /\.gif$/, loader: 'url-loader' },
      { test: /\.png$/, loader: 'url-loader' },
      { test: /\.cur/, loader: 'url-loader' },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      {
        test: /\.less$/,
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2,
        }
      }
    },
  },
  plugins,
};
