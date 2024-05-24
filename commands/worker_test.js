const { parentPort, isMainThread, Worker } = require('node:worker_threads');
const { processLoca } = require('../support_files/loca_convert');
// const vscode = require('vscode');


parentPort.once('message', (message) => {
    parentPort.postMessage(message);
});

