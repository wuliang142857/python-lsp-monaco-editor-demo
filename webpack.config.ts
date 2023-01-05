import * as path from "path";
import * as webpack from "webpack";
import {Configuration as WebpackDevServerConfiguration} from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import {description, version} from "./package.json";
import {WebpackConfiguration} from "webpack-cli";

const sourcePath: string = path.join(__dirname, "client");
const distPath: string = path.join(__dirname, "build");
const mainFile: string = path.join(sourcePath, "client.ts");

const publicPath: string = `/`;

interface Configuration extends WebpackConfiguration {
    devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
    "mode": "development",
    "devtool": "cheap-module-source-map",
    "target": "web",
    "entry": {
        "main": mainFile
    },
    "output": {
        "path": distPath,
        "filename": "[name].bundle.js",
        publicPath,
    },
    "module": {
        "rules": [
            {
                "test": /\.tsx?$/,
                "exclude": /node_modules/,
                "loader": "esbuild-loader",
                options: {
                    loader: "tsx",
                    target: "es2015",
                    // eslint-disable-next-line global-require
                    tsconfigRaw: require("./tsconfig.json"),
                    minify: false,
                    sourcemap: true
                }
            },
            {
                "enforce": "pre",
                "test": /\.js$/,
                "loader": "source-map-loader",
                exclude: [/vscode-jsonrpc/, /vscode-languageclient/, /vscode-languageserver-protocol/]
            },
            {
               "test": /\.(icon|eot|svg|ttf|TTF|woff|woff2)(\?\S*)?$/,
                "loader": "file-loader",
                "type": 'javascript/auto',
                "exclude": /node_modules/,
            },
            {
                "test": /\.(icon|eot|svg|ttf|TTF|woff|woff2|png|jpe?g|gif)(\?\S*)?$/,
                "loader": "file-loader",
                "include": path.resolve(__dirname, "./node_modules/monaco-editor"),
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    "resolve": {
        extensions: ['.ts','.js', '.json', '.ttf'],
        fallback: {
            path: require.resolve("path-browserify"),
        }
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            "title": `${description}@${version}`,
            "template": path.resolve(sourcePath, "template.html"),
            "inject": true,
            "favicon": path.resolve(sourcePath, "logo.png")
        }),
    ],
    "devServer": {
        "port": 8088,
        "host": "0.0.0.0",
        "compress": true,
        "historyApiFallback": {
            "rewrites": [
                {"from": /^\/$/, "to": `${publicPath}index.html`}
            ]
        },
        "headers": {
            "Cache-Control": "no-store",
            "Pragma": "no-cache"
        },
        "proxy": {
        }
    },
};

export default config;
