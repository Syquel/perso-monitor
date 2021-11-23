import { Configuration, ContextReplacementPlugin, HotModuleReplacementPlugin, IgnorePlugin, ProgressPlugin } from 'webpack';
import * as path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import { EnvVars, getIfUtils, IfUtils, removeEmpty } from 'webpack-config-utils';
import webpackNodeExternals from 'webpack-node-externals';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

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

type WebpackEnv = Record<string, boolean>;

export default function (env: WebpackEnv, argv: { mode: EnvVars, env: WebpackEnv }): Configuration {
    void env;
    const utils: IfUtils = getIfUtils(argv.mode);

    return {
        target: 'node',
        mode: utils.ifDevelopment('development', 'production'),
        devtool: utils.ifDevelopment('inline-source-map', 'source-map'),
        watch: utils.ifDevelopment(true, false),
        entry: removeEmpty<string>([
            utils.ifDevelopment('webpack/hot/poll?100'),
            './src/main.ts'
        ]),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js'
        },
        plugins: removeEmpty([
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
            utils.ifDevelopment(new HotModuleReplacementPlugin()),
            utils.ifDevelopment(new RunScriptWebpackPlugin({ name: 'main.js' }))
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
        externals: utils.ifDevelopment(webpackNodeExternals({ allowlist: [ 'webpack/hot/poll?100' ] }), []),
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
