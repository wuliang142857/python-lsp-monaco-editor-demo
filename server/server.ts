// -*- coding: utf-8 -*-
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4  fileencoding=utf-8 ff=unix ft=typescript
// @author: wuliang
// @contact: garcia.wul@alibaba-inc.com
// @date 2022/03/10 00:37

import * as path from 'path';
import express from 'express';
import * as ws from "ws";
import * as http from "http";
import * as net from "net";
import * as url from "url";
import * as rpc from "@codingame/monaco-jsonrpc";
import * as server from '@codingame/monaco-jsonrpc/lib/server';
import * as lsp from 'vscode-languageserver';

const app = express();
// 前端静态文件所在地址
const rootDir = path.join(__dirname, "..");
app.use(express.static(path.join(rootDir, "build")));

const expressServer = app.listen(3000);

const wss = new ws.Server({
    noServer: true,
    perMessageDeflate: false
});

expressServer.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === '/lsp') {
        wss.handleUpgrade(request, socket, head, (webSocket) => {
            const socket2 = {
                send: (content) =>
                    webSocket.send(content, (error) => {
                        if (error) {
                            throw error;
                        }
                    }),
                onMessage: (cb) => webSocket.on('message', cb),
                onError: (cb) => webSocket.on('error', cb),
                onClose: (cb) => webSocket.on('close', cb),
                dispose: () => webSocket.close(),
            };
            // launch the server when the web socket is opened
            if (webSocket.readyState === webSocket.OPEN) {
                launch(socket2);
            } else {
                webSocket.on('open', () => launch(socket));
            }
        });
    }
});

function launch(socket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    const socketConnection = server.createConnection(reader, writer, () =>
        socket.dispose()
    );
    const serverConnection = server.createServerProcess(
        'Python',
        'pyls' // path to python-lsp-server called with pylsp command
    );
    server.forward(socketConnection, serverConnection, (message) => {
        // console.log('server forward');
        if (rpc.isRequestMessage(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                const initializeParams = message.params;
                // @ts-ignore
                initializeParams.processId = process.pid;
            }
        }
        return message;
    });
}
