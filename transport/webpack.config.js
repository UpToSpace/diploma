const path = require('path');

module.exports = {
    // Your entry file, assuming a single entry point for simplicity
    entry: './src/index.js',

    // Output configuration
    output: {
        filename: 'bundle.js', // Output bundle file name
        path: path.resolve(__dirname, 'dist'), // Output directory
    },

    // Module resolutions and polyfills
    resolve: {
        // Polyfills and module fallbacks
        fallback: {
            "path": require.resolve("path-browserify"), // Polyfill for 'path'
            "fs": false, // Ignore 'fs' as it's not typically needed in browser environments
        }
    },

    // Assuming you're using a development mode for easier debugging
    mode: 'development',

    // Module rules, assuming you have some like Babel-loader for JavaScript
    module: {
        rules: [
            {
                test: /\.js$/, // Targeting JavaScript files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'] // Assuming a simple Babel setup
                    }
                }
            },
            // You can add more loaders here for other types of files like CSS, images, etc.
        ]
    },

    // Simple dev server setup
    devServer: {
        static: './dist',
        open: true // Automatically open the browser
    }
};
