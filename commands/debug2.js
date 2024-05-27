const vscode = require('vscode');
const fs = require('fs');
const os = require('os');

const path = require('path');

const LSLIB_DLL = 'LSLib.dll';
const TOOL_SUBDIR = 'Tools\\';

const { getConfig } = require('../support_files/config');
const { lslibPath, rootModPath,  gameInstallLocation } = getConfig();
const compatRootModPath = path.join(rootModPath + "\\");
const lslibToolsPath = path.join(lslibPath, TOOL_SUBDIR);

const { saveConfigFile, loadConfigFile } = require('../support_files/helper_functions')

const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { FIND_FILES, getFormats, dirSeparator } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();
const { processPak } = require('../support_files/process_pak.js');

const { isMainThread, parentPort, Worker } = require('node:worker_threads')

 
const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    // raiseInfo("hi dipshit! 💩");

    let halfCoreCount = os.availableParallelism() / 2;
    let workerArray = [];
    let workerInfo = await loadConfigFile(true);

    if (isMainThread) {
        for (let i = 0; i < halfCoreCount; i++) {
            workerArray.push(new Worker(__dirname + "/worker_test.js"));

            workerArray[i].on('message', (message) => {
                console.log(`${message} received from worker ${workerArray[i].threadId}!`)
            });

            workerArray[i].postMessage(workerInfo);
        }

    }

    saveConfigFile();
    console.log(await loadConfigFile(true));


});

module.exports = { debug2 }
