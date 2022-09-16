// -*- coding: utf-8 -*-
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4  fileencoding=utf-8 ff=unix ft=typescript
// @author: wuliang142857
// @contact: wuliang142857@gmail.com
// @date 2022/03/10 00:37

import * as path from 'path';
import express from 'express';
import { WebSocketServer } from 'ws';
import * as http from "http";
import * as net from "net";
import * as url from "url";
import {IWebSocket, WebSocketMessageReader, WebSocketMessageWriter} from 'vscode-ws-jsonrpc';
import * as server from 'vscode-ws-jsonrpc/server';
import * as lsp from 'vscode-languageserver';
import {Message} from 'vscode-languageserver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// 前端静态文件所在地址
const rootDir = path.join(__dirname, "..");
app.use(express.static(path.join(rootDir, "build")));

const expressServer = app.listen(3000);

const wss = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false
});

expressServer.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    const pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (pathname === '/lsp') {
        wss.handleUpgrade(request, socket, head, (webSocket) => {
            const socket2 = {
                send: (content:any) =>
                    webSocket.send(content, (error) => {
                        if (error) {
                            throw error;
                        }
                    }),
                onMessage: (cb:any) => webSocket.on('message', cb),
                onError: (cb:any) => webSocket.on('error', cb),
                onClose: (cb:any) => webSocket.on('close', cb),
                dispose: () => webSocket.close(),
            };
            // launch the server when the web socket is opened
            if (webSocket.readyState === webSocket.OPEN) {
                launch(socket2);
            } else {
                webSocket.on('open', () => launch(socket2));
            }
        });
    }
});

function launch(socket: IWebSocket) {
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const socketConnection = server.createConnection(reader, writer, () =>
        socket.dispose()
    );
    const serverConnection:any = server.createServerProcess(
        'Python',
        'pyls' // path to python-lsp-server called with pylsp command
    );
    server.forward(socketConnection, serverConnection, (message) => {
        // console.log('server forward');
        if (Message.isRequest(message)) {
            if (message.method === lsp.InitializeRequest.type.method) {
                const initializeParams = message.params;
                // @ts-ignore
                initializeParams.processId = process.pid;
            }
        }
        return message;
    });
}
