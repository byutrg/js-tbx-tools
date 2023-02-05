export default {
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
        extensions: ['.ts', '.tsx'],
        extensionAlias: {
            '.js': ['.js', '.ts'],
            '.cjs': ['.cjs', '.cts'],
            '.mjs': ['.mjs', '.mts'],
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
