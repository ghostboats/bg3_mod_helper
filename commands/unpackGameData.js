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

const { createConversionWorkers } = require('../support_files/conversion_junction');

let unpackedGameDataDirectory;


async function getTempDir() {
    unpackedGameDataDirectory = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Unpacked game data folder. Needs at least 160GB free space.'
    })

    if (!unpackedGameDataDirectory || unpackedGameDataDirectory.length === 0) {
        vscode.window.showErrorMessage('No folder selected.');
        return false;
    } else {
        return true;
    }
}


// eventually we can add specific game data files for unpacking, but atm it'll just grab everything.
const unpackGameData = vscode.commands.registerCommand('bg3-mod-helper.unpackGameDataCommand', async function () {
    let filesToConvert = await FIND_FILES(pak, path.join(gameInstallLocation, "Data"));
    let workerConfig = JSON.parse(loadConfigFile(true));

    // made this a boolean so things don't get converted unless an unpack location is selected
    if (isMainThread && await getTempDir()) {
        // console.log(filesToConvert);
        createConversionWorkers(filesToConvert, workerConfig, unpackedGameDataDirectory);
        raiseInfo(`Game data unpacking started. Please allow a few hours for this to complete, it's a big game.`);
    }
});


module.exports = { unpackGameData }
