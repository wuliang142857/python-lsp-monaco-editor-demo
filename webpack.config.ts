import * as path from "path";
import * as webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import _ from "lodash";
import * as pkg from "./package.json";

const sourcePath: string = path.join(__dirname, "client");
const distPath: string = path.join(__dirname, "build");
const mainFile: string = path.join(sourcePath, "main.ts");

const publicPath: string = `/`;
let commandTarget: string | null | undefined = process.env.NODE_ENV;
if (!commandTarget) {
    commandTarget = "dev";
}
const isRelease: boolean = _.includes(_.toLower(commandTarget), "production");
// const isRelease = false;

// @ts-ignore
const config: webpack.Configuration = {
    "mode": isRelease ? "production" : "development",
    "devtool": isRelease ? false : "cheap-module-source-map",
    "target": "web",
    "entry": {
        "main": mainFile,
         "editor.worker": 'monaco-editor-core/esm/vs/editor/editor.worker.js'
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
                    minify: isRelease,
                    sourcemap: !isRelease
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
                "include": path.resolve(__dirname, "./node_modules/monaco-editor-core"),
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    "resolve": {
        extensions: ['.ts','.js', '.json', '.ttf'],
        "alias": {
            'vscode': require.resolve('monaco-languageclient/lib/vscode-compatibility'),
        }
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new HtmlWebpackPlugin({
            "title": `${pkg.description}@${pkg.version}`,
            "template": path.resolve(sourcePath, "template.html"),
            "inject": true,
            "favicon": path.resolve(sourcePath, "logo.png")
        }),
    ]
};

export default config;
