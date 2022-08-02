"use strict";
// -*- coding: utf-8 -*-
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4  fileencoding=utf-8 ff=unix ft=typescript
// @author: wuliang
// @contact: garcia.wul@alibaba-inc.com
// @date 2022/03/10 00:37
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var path = __importStar(require("path"));
var express_1 = __importDefault(require("express"));
var ws = __importStar(require("ws"));
var url = __importStar(require("url"));
var rpc = __importStar(require("@codingame/monaco-jsonrpc"));
var server = __importStar(require("@codingame/monaco-jsonrpc/lib/server"));
var lsp = __importStar(require("vscode-languageserver"));
var app = (0, express_1["default"])();
var rootDir = path.join(__dirname, "..");
app.use(express_1["default"].static(path.join(rootDir, "build")));
var expressServer = app.listen(3000);
var wss = new ws.Server({
    noServer: true,
    perMessageDeflate: false
});
expressServer.on('upgrade', function (request, socket, head) {
    var pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === '/lsp') {
        wss.handleUpgrade(request, socket, head, function (webSocket) {
            var socket2 = {
                send: function (content) {
                    return webSocket.send(content, function (error) {
                        if (error) {
                            throw error;
                        }
                    });
                },
                onMessage: function (cb) { return webSocket.on('message', cb); },
                onError: function (cb) { return webSocket.on('error', cb); },
                onClose: function (cb) { return webSocket.on('close', cb); },
                dispose: function () { return webSocket.close(); }
            };
            console.log({ state: webSocket.readyState, open: webSocket.OPEN });
            // launch the server when the web socket is opened
            if (webSocket.readyState === webSocket.OPEN) {
                launch(socket2);
            }
            else {
                webSocket.on('open', function () { return launch(socket); });
            }
        });
    }
});
function launch(socket) {
    var reader = new rpc.WebSocketMessageReader(socket);
    var writer = new rpc.WebSocketMessageWriter(socket);
    console.log('connection established');
    var socketConnection = server.createConnection(reader, writer, function () {
        return socket.dispose();
    });
    var serverConnection = server.createServerProcess('JSON', '/usr/local/bin/pylsp' // path to python-lsp-server called with pylsp command
    );
    server.forward(socketConnection, serverConnection, function (message) {
        // console.log('server forward');
        if (rpc.isRequestMessage(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                var initializeParams = message.params;
                // @ts-ignore
                initializeParams.processId = process.pid;
            }
        }
        return message;
    });
}
//# sourceMappingURL=server.js.map