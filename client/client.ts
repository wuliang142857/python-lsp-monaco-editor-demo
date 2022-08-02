// -*- coding: utf-8 -*-
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4 fileencoding=utf-8 ff=unix ft=typescript
// @author: wuliang
// @contact: garcia.wul@alibaba-inc.com
// @date 2022/03/09 23:03

import { listen } from '@codingame/monaco-jsonrpc';
import * as monaco from 'monaco-editor-core'
import {
    MonacoLanguageClient, MessageConnection, CloseAction, ErrorAction,
    MonacoServices, createConnection
} from 'monaco-languageclient';
import normalizeUrl from "normalize-url";
import ReconnectingWebSocket from "reconnecting-websocket";

// register Monaco languages
monaco.languages.register({
    id: 'python',
    extensions: ['.py'],
    aliases: ['python', 'PYTHON'],
    mimetypes: ['text/x-python'],
});

// create Monaco editor
const value = `import os
import sys
`;
monaco.editor.create(document.getElementById("container")!, {
    model: monaco.editor.createModel(
        value,
        'python',
        monaco.Uri.parse('inmemory://demo.py')
    ),
    theme: 'vs-dark',
    glyphMargin: true,
    lightbulb: {
        enabled: true
    }
});

// install Monaco language client services
MonacoServices.install(monaco);

// create the web socket
const url = createUrl('/lsp')
const webSocket = createWebSocket(url);
// listen when the web socket is opened
listen({
    webSocket,
    onConnection: connection => {
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => {
            console.log("onClose");
            disposable.dispose();
        });
    }
});

function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
    return new MonacoLanguageClient({
        name: "Sample Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['python'],
            // disable the default error handler
            errorHandler: {
                error: () => ErrorAction.Continue,
                closed: () => CloseAction.DoNotRestart
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: (errorHandler, closeHandler) => {
                return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
            }
        }
    });
}

function createUrl(path: string): string {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
}

function createWebSocket(url: string): WebSocket {
    const socketOptions = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: true
    };
    // @ts-ignore
    return new ReconnectingWebSocket(url, [], socketOptions);
}
