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

const { isMainThread, parentPort, Worker } = require('node:worker_threads')

const { jobs, buildPathArrays } = require('../support_files/conversion_junction');

 
const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    // raiseInfo("hi dipshit! 💩");

    let filesToConvert = await FIND_FILES(pak, path.join(gameInstallLocation, "Data"));

    let workerArray = [];
    let workerConfig = JSON.parse(loadConfigFile(true));

    let jobsTotal = jobs(filesToConvert.length);

    let temp_dir = path.normalize("W:\\Libraries\\Documents\\Baldur's Gate 3 Mods\\unpacking_tests\\unpacked_game_data");

    if (isMainThread) {
        // console.log(filesToConvert);
        filesToConvert = buildPathArrays(filesToConvert);
        raiseInfo(`unpacking started.`);

        let convertFileNames = filesToConvert.map(fileArray => fileArray.map(file => path.basename(file)));

        // will only unpack 
        for (let i = 0; i < jobsTotal; i++) {
            raiseInfo(`${convertFileNames[i]}\n`, false);
            workerArray.push(new Worker(__dirname + "/worker_test.js", { 
                workerData:  { 
                    // passes the crystallized configuration settings to each of the workers
                    workerConfig, 
                    // adding 2 to the workerId because 0 is the extension host and 1 is the main window
                    workerId: i + 2, 
                    // passes the path of the file that needs to be converted
                    jobsTotal, 
                    task: filesToConvert[i],
                    jobDestPath: temp_dir
                }
            }));
        }
    }
});



module.exports = { debug2 }
