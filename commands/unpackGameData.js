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

const { FIND_FILES, getFormats, dirSeparator, LOAD_LSLIB } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();
const { processPak } = require('../support_files/process_pak.js');

const { isMainThread, MessageChannel, Worker } = require('node:worker_threads');
const comsPorts = new MessageChannel();

const { jobs, buildPathArrays } = require('../support_files/conversion_junction');

let temp_dir;


async function getTempDir() {
    temp_dir =  await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Unpacked game data folder. Needs at least 160GB free space.'
    })

    if (!temp_dir || temp_dir.length === 0) {
        vscode.window.showInformationMessage('No folder selected.');
        return false;
    } else {
        return true;
    }
}

 
const unpackGameData = vscode.commands.registerCommand('bg3-mod-helper.unpackGameDataCommand', async function () {
    // raiseInfo("hi dipshit! 💩");

    let filesToConvert = await FIND_FILES(pak, path.join(gameInstallLocation, "Data"));

    // an array of workers
    let workerArray = [];
    let workerConfig = JSON.parse(loadConfigFile(true));

    // the jobs function returns the lower of half the user's cpu cores or the number of things being unpacked
    let jobsTotal = jobs(filesToConvert.length);

    let jobsFinished = 0;

    // made this a boolean so things don't get converted unless an unpack location is selected
    if (isMainThread && await getTempDir()) {
        // console.log(filesToConvert);
        filesToConvert = buildPathArrays(filesToConvert);
        raiseInfo(`Game data unpacking started. Please allow a few hours for this to complete, it's a big game.`);

        // nested .map() functionality :o
        let convertFileNames = filesToConvert.map(fileArray => fileArray.map(file => path.basename(file)));

        // for each job, which is either a single file or an array of files sorted from smallest to largest file size, create a worker and give it the data it needs to unpack those files via workerData.
        for (let i = 0; i < jobsTotal; i++) {
            raiseInfo(`${convertFileNames[i]}\n`, false);
            workerArray.push(new Worker(__dirname + "/conversion_worker.js", { 
                workerData:  { 
                    // passes the crystallized configuration settings to each of the workers
                    workerConfig, 
                    // adding 2 to the workerId because 0 is the extension host and 1 is the main window
                    workerId: i + 2, 
                    // passes the path of the file that needs to be converted
                    jobsTotal, 
                    task: filesToConvert[i],
                    jobDestPath: temp_dir,
                }
            }));

            workerArray[i].on('message', (message) => {
                if (message.includes("done.")) {
                    raiseInfo(message);
                    jobsFinished++;
                }

                if (jobsFinished === jobsTotal) {
                    raiseInfo("All game data unpacked!")
                }
            })
        }
    }
});



module.exports = { unpackGameData }
