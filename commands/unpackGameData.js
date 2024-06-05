const vscode = require('vscode');

const path = require('path');

const { getConfig, loadConfigFile, setConfig } = require('../support_files/config');
const { gameInstallLocation } = getConfig();

const { raiseInfo } = require('../support_files/log_utils');

const { FIND_FILES, getFormats } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();

const { isMainThread } = require('node:worker_threads');

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
    setConfig();
    let workerConfig = loadConfigFile();

    // made this a boolean so things don't get converted unless an unpack location is selected
    if (isMainThread && await getTempDir()) {
        // console.log(filesToConvert);
        createConversionWorkers(filesToConvert, workerConfig, unpackedGameDataDirectory);
        raiseInfo(`Game data unpacking started. Please allow a few hours for this to complete, it's a big game.`);
    }
});


module.exports = { unpackGameData }
