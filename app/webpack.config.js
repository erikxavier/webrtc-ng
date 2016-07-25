// import Webpack plugins
// var cleanPlugin = require('clean-webpack-plugin');
// var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
var webpack = require('webpack');

// define Webpack configuration object to be exported
var config = {
    context: __dirname + '/js',
    entry: './main.js',
    output: {
        path: __dirname + '/js',
        filename: 'app.js'
    },
    resolve: {
        alias: {
          'npm': __dirname + '/node_modules'
        }
    },
    // module: {
    //     loaders: [
    //         {
    //             test: /\.css$/,
    //             loader: 'style!css'
    //         },
    //         {
    //             test: /\.(woff|woff2)$/,
    //             loader: 'url?limit=10000&mimetype=application/font-woff'
    //         },
    //         {
    //             test: /\.(eot|svg|ttf)$/,
    //             loader: 'file'
    //         },
    //         {
    //             test: /\.js?$/,
    //             include: __dirname + '/app', 
    //             loader: 'babel'
    //         }
    //     ],
    //     preLoaders: [
    //         {
    //             test: /\.js?$/,
    //             exclude: /node_modules/,
    //             loader: 'jshint'
    //         }
    //     ]
    // },
    plugins: [
        // new cleanPlugin(['dist']),
        // new ngAnnotatePlugin({
        //     add: true
        // }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};

module.exports = config;