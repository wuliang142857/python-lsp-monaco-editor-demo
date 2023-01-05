// -*- coding: utf-8 -*-
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4 fileencoding=utf-8 ff=unix ft=typescript
// @author: wuliang142857
// @contact: wuliang142857@gmail.com
// @date 2022/03/09 23:03

import 'monaco-editor/esm/vs/editor/editor.all.js';

// support all editor features
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import {buildWorkerDefinition} from 'monaco-editor-workers';

import {
    MonacoLanguageClient,
    CloseAction,
    ErrorAction,
    MonacoServices,
    MessageTransports
} from 'monaco-languageclient';
import {toSocket, WebSocketMessageReader, WebSocketMessageWriter} from 'vscode-ws-jsonrpc';
import normalizeUrl from 'normalize-url';
import {StandaloneServices} from 'vscode/services';
import getMessageServiceOverride from 'vscode/service-override/messages';
import {editor} from "monaco-editor/esm/vs/editor/editor.api.js";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import ITextModel = editor.ITextModel;
import IEditorMouseEvent = editor.IEditorMouseEvent;
import IModelDecoration = editor.IModelDecoration;
import {func} from "vscode-languageserver/lib/common/utils/is";

StandaloneServices.initialize({
    ...getMessageServiceOverride(document.body)
});
// buildWorkerDefinition('', new URL('', window.location.href).href, false);

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
let codeEditor: IStandaloneCodeEditor = monaco.editor.create(document.getElementById("container")!, {
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

// 绑定添加断点的事件
codeEditor.onMouseDown((e: IEditorMouseEvent) => {
    if (e.target.detail && e.target.detail.isAfterLines === false && e.target.detail.offsetX >= 0) {
        let lineNumber: number = e.target.position.lineNumber;
        if (hasBreakPoint(lineNumber)) {
            removeBreakPoint(lineNumber);
        } else {
            addBreakPoint(lineNumber);
        }
    }
});



/**
 * 删除断点
 * @param lineNumber
 */
function hasBreakPoint(lineNumber: number) {
    let decorations: IModelDecoration[] = codeEditor.getLineDecorations(lineNumber);
    return decorations.some((decoration: IModelDecoration) => {
        return decoration.options.linesDecorationsClassName === "breakpoints";
    });
}

/**
 * 删除断点
 * @param lineNumber
 */
function removeBreakPoint(lineNumber: number) {
    let model: ITextModel = codeEditor.getModel();
    let decorations: IModelDecoration[] = codeEditor.getLineDecorations(lineNumber);
    let ids = decorations.map((decoration: IModelDecoration) => {
        return decoration.id;
    })
    if (ids && ids.length) {
        model.deltaDecorations(ids, []);
    }
}


/**
 * 添加断点
 * @param lineNumber
 */
function addBreakPoint(lineNumber: number) {
    let model: ITextModel = codeEditor.getModel();
    model.deltaDecorations([], [{
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
            isWholeLine: true,
            // className: 'breakpoints-line',
            linesDecorationsClassName: "breakpoints"
        }
    }])
}

// create the web socket
// const url = createUrl('/lsp')
// const webSocket = new WebSocket(url);
//
// webSocket.onopen = () => {
//     const socket = toSocket(webSocket);
//     const reader = new WebSocketMessageReader(socket);
//     const writer = new WebSocketMessageWriter(socket);
//     const languageClient = createLanguageClient({
//         reader,
//         writer
//     });
//     languageClient.start();
//     reader.onClose(() => languageClient.stop());
// };
//
//
// function createLanguageClient(transports: MessageTransports): MonacoLanguageClient {
//     return new MonacoLanguageClient({
//         name: "Sample Language Client",
//         clientOptions: {
//             // use a language id as a document selector
//             documentSelector: ['python'],
//             // disable the default error handler
//             errorHandler: {
//                 error: () => ({ action: ErrorAction.Continue }),
//                 closed: () => ({ action: CloseAction.DoNotRestart })
//             }
//         },
//         // create a language client connection from the JSON RPC connection on demand
//         connectionProvider: {
//             get: () => {
//                 return Promise.resolve(transports);
//             }
//         }
//     });
// }

function createUrl(path: string): string {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return normalizeUrl(`${protocol}://${location.host}${location.pathname}${path}`);
}

