// -*- coding: utf-8 -*-
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4  fileencoding=utf-8 ff=unix ft=typescript
// @author: wuliang
// @contact: garcia.wul@alibaba-inc.com
// @date 2022/03/10 00:05

require("monaco-editor-core");

(self as any).MonacoEnvironment = {
    getWorkerUrl: () => './editor.worker.bundle.js'
}
require('./client');
