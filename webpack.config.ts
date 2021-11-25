import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import * as path from 'path';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration, ContextReplacementPlugin, HotModuleReplacementPlugin, IgnorePlugin, ProgressPlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import webpackNodeExternals from 'webpack-node-externals';

const lazyModules: string[] = [
    // nestjs
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'cache-manager',
    'class-transformer',
    'class-validator',

    // jsdom
    'bufferutil',
    'canvas',
    'utf-8-validate'
];

const checkLazyModules = (resource: string): boolean => {
    // Only consider well-known lazy-loaded modules
    if (!lazyModules.includes(resource)) {
        return false;
    }

    // Mark non-available well-known lazy-loaded modules as ignored
    try {
        require.resolve(resource, {
            paths: [process.cwd()],
        });
    } catch (err) {
        return true;
    }

    return false;
};

function compact<T>(array: ReadonlyArray<T | undefined>): Array<Exclude<T, undefined>> {
    return array.filter(entry => entry !== undefined) as Array<Exclude<T, undefined>>;
}

type WebpackEnv = {
    WEBPACK_SERVE?: boolean,
    WEBPACK_BUILD?: boolean,
    WEBPACK_WATCH?: boolean
    [p: string]: unknown
};
type WebpackArgv = { mode: Configuration['mode'], env: WebpackEnv, watch?: boolean, hot?: boolean };

export default function (env: WebpackEnv, argv: WebpackArgv): Configuration {
    const isDevelopment: boolean = argv.mode == 'development';
    const isWatch: boolean = env.WEBPACK_WATCH === true;

    return {
        target: 'node',
        mode: isDevelopment ? 'development' : 'production',
        devtool: isDevelopment ? 'inline-source-map' : 'source-map',
        entry: compact([
            isWatch ? 'webpack/hot/poll?100' : undefined,
            './src/main.ts'
        ]),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js'
        },
        plugins: compact([
            new ProgressPlugin(),
            new CleanWebpackPlugin(),
            new ESLintWebpackPlugin({extensions: [ '*.ts' ]}),
            new IgnorePlugin({checkResource: checkLazyModules}),
            new CopyPlugin({
                patterns: [ {from: 'src/config.json'} ],
            }),
            new ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
            }),
            isWatch ? new HotModuleReplacementPlugin() : undefined,
            isWatch ? new RunScriptWebpackPlugin({ name: 'main.js' }) : undefined
        ]),
        module: {
            rules: [
                {
                    test: /\.ts(x)?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: [
                '.tsx',
                '.ts',
                '.js'
            ],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: 'tsconfig.build.json'
                })
            ]
        },
        externalsPresets: { node: true },
        externals: isWatch ? webpackNodeExternals({ allowlist: [ 'webpack/hot/poll?100' ] }) : [],
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        ignoreWarnings: [
            {
                module: /node_modules\/express\/lib\/view\.js/,
                message: /the request of a dependency is an expression/
            },
            {
                module: /node_modules\/@nestjs\/common\/utils\/load-package\.util\.js/,
                message: /the request of a dependency is an expression/
            },
            {
                module: /node_modules\/@nestjs\/core\/helpers\//,
                message: /the request of a dependency is an expression/
            }
        ]
    };
};
