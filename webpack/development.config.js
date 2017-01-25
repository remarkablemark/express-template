'use strict';

/**
 * Module dependencies.
 */
require('dotenv').config();
const path = require('path');
const webpack = require('webpack');

const port = process.env.WDS_PORT;
const host = process.env.IP || 'localhost';
const url = `http://${host}:${port}`;

/**
 * Development webpack.
 */
module.exports = {
    entry: [
        path.join(__dirname, '../src/main.js'),
        'webpack/hot/only-dev-server',
        'webpack-dev-server/client?' + url
    ],

    output: {
        path: path.join(__dirname, '../build/'),
        filename: 'bundle.js',
        publicPath: url + '/build'
    },

    debug: true,
    devtool: 'eval-source-map',

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['react', 'es2015', 'react-hmre']
                }
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                APP_NAME: JSON.stringify(require('../config/').appName)
            }
        })
    ],

    devServer: {
        quiet: true,
        inline: true,
        hot: true,
        host: host,
        port: port
    }
};
