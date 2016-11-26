const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const findCacheDir = require('find-cache-dir');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);

module.exports = {
    devtool: 'eval',

    entry: [
        // require.resolve('webpack-dev-server/client') + '?/',
        // require.resolve('webpack/hot/dev-server'),

        require.resolve('react-dev-utils/webpackHotDevClient'),
        require.resolve('./polyfills'),
        paths.appIndexJs,
    ],

    output: {
        path: paths.appBuild,
        pathinfo: true,
        filename: 'static/js/bundle.js',
        publicPath,
    },

    resolve: {
        fallback: paths.nodePaths,
        extensions: ['.js', '.json', '.jsx', ''],
    },

    module: {
        preLoaders: [{
            test: /\.jsx?$/,
            loader: 'eslint',
            include: paths.appSrc,
        }],
        loaders: [{
            test: /\.jsx?$/,
            include: paths.appSrc,
            loader: 'babel',
            query: {
                cacheDirectory: findCacheDir({
                    name: 'react-scripts',
                }),
            },
        }, {
            test: /\.global\.css$/,
            loaders: [
                'style-loader',
                'css-loader?sourceMap'
            ]
        }, {
            test: /^((?!\.global).)*\.css$/,
            loaders: [
                'style-loader',
                'css-loader?modules&&localIdentName=__focus__[name]__[local]__[hash:base64:5]'
            ]
        }, {
            test: /\.json$/,
            loader: 'json',
        }, {
            test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
            loader: 'file',
            query: {
                name: 'static/media/[name].[hash:8].[ext]',
            },
        }, {
            test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
            loader: 'url',
            query: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
            },
        }],
    },

    postcss() {
        return [
            autoprefixer({
                browsers: [
                    'Chrome > 50',
                ],
            }),
        ];
    },

    plugins: [
        new InterpolateHtmlPlugin({
            PUBLIC_URL: publicUrl,
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        new webpack.DefinePlugin(env),
        new webpack.HotModuleReplacementPlugin(),
        new CaseSensitivePathsPlugin(),
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    ],

    target: 'electron-renderer',
};
