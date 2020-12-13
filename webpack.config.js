const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const env = process.env
const __DEV__ = env.NODE_ENV === 'development'
const ANALYZER = Boolean(env.ANALYZER)
const plugins = []
if (ANALYZER) {
    plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerHost: '127.0.0.1',
            analyzerPort: 8080,
            reportFilename: 'index.html',
            defaultSizes: 'parsed',
            openAnalyzer: true,
            generateStatsFile: false,
            statsFilename: 'stats.json',
            statsOptions: null,
            logLevel: 'info',
        })
    )
}
module.exports = {
    devtool: __DEV__ ? 'source-map' : '',
    mode: __DEV__ ? 'development' : 'production',
    entry: {
        build: path.join(__dirname, './src/index.ts')
    },
    target: 'node',
    output: {
        library: {
            root: 'BiliDynamicForward',
            amd: 'bili-dynamic-forward',
            commonjs: 'bili-dynamic-forward'
        },
        libraryTarget: 'umd',
        path: path.join(__dirname, './dist'),
        filename: 'index.js'
    },
    externals: [],
    node: {
        Buffer: false,
        __filename: false,
        __dirname: false,
    },
    plugins,
    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            use: 'ts-loader', //配置加载typescript
            exclude: /node_modules/
        },]
    },
    resolve: {
        //路径别名
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        //路径别名自动解析确定的扩展
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    }
}