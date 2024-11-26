const path = require('path');
const { override, addWebpackAlias, addWebpackResolve, addWebpackPlugin } = require("customize-cra");
const webpack = require('webpack');

module.exports = override(
    addWebpackAlias({
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@contexts': path.resolve(__dirname, 'src/contexts'),
        '@contracts': path.resolve(__dirname, 'src/contracts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@routes': path.resolve(__dirname, 'src/routes'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@sandstorm_verifier_wasm': path.resolve(__dirname, 'src/third-party/sandstorm_verifier_wasm'),
    }),
    addWebpackResolve({
        fallback: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify'
        }
    }),
    addWebpackPlugin(
        new webpack.ProvidePlugin({
            //process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    )
);
