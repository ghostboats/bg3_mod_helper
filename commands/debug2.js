const vscode = require('vscode');
const fs = require('fs');
const os = require('os');

const path = require('path');

const LSLIB_DLL = 'LSLib.dll';
const TOOL_SUBDIR = 'Tools\\';

const { getConfig } = require('../support_files/config');
const { lslibPath, rootModPath } = getConfig();
const compatRootModPath = path.join(rootModPath + "\\");
const lslibToolsPath = path.join(lslibPath, TOOL_SUBDIR);

const { raiseInfo } = require('../support_files/log_utils');
const { LSLIB } = require('../support_files/lslib_utils.js');
 
const { parentPort, isMainThread, Worker } = require('node:worker_threads');

const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    // raiseInfo("hi dipshit! 💩");

    if (isMainThread) {
        let halfCoreCount = os.availableParallelism() / 2;
        let workerArray = [];
    
        for (let i = 0; i < halfCoreCount; i++) {
            workerArray.push(new Worker(path.join(__dirname, './worker_test.js')));
    
            workerArray[i].once('message', (message) => {
                console.log(message);
            });

            workerArray[i].postMessage(`hi from worker ${workerArray[i].threadId}`);
        }
    }

});

module.exports = { debug2 }
