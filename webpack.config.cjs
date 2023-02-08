

module.exports = {
    entry: 
        './src/tbx-tools.ts'
    ,
    devtool: 'inline-source-map',
    output: {
        filename: 'tbx-tools.js',
        library: {
            type: "module"
        }
    },
    experiments: {
        outputModule: true
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        extensionAlias: {
            '.js': ['.js', '.ts'],
            '.cjs': ['.cjs', '.cts'],
            '.mjs': ['.mjs', '.mts'],
        },
        fallback: {
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
            timers: require.resolve("timers-browserify")
        }
    },
    module: {
        rules: [
            {
                test: /\.m?tsx?$/,
                loader: 'ts-loader', 
                exclude: /node_modules/
            }
        ]
    }
}
