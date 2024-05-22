const vscode = require('vscode');
const fs = require('fs');
const os = require('os');

const { Worker, isMainThread, parentPort } = require('worker_threads');
const path = require('path');
const { getConfig } = require('../support_files/config');

const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils.js');
const bg3mh_logger = CREATE_LOGGER();

const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    const config = getConfig();
    const localizationPath = path.join(config.rootModPath, 'Localization');
    let coreCount = os.availableParallelism();

    raiseInfo(`half of your cpu's cores: ${coreCount / 2}`);


    if (isMainThread) {
        const testWorker = new Worker(__filename);

        console.log("in main thread");

        testWorker.on('message', (msg) => {
            console.log(msg);
        });
    }
    else {
        console.log("in worker thread");
        parentPort.postMessage("hi");
    }

    // after you are through with this command, the following line must be uncommented and the only thing left for this file to be considered cleaned up.
    // raiseInfo("hi dipshit :)");


});

module.exports = debug2;
