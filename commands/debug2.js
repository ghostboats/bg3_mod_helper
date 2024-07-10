const vscode = require('vscode');
const fs = require('fs');
const os = require('os');

const path = require('path');

const LSLIB_DLL = 'LSLib.dll';
const TOOL_SUBDIR = 'Tools\\';

const { getConfig, loadConfigFile, setModName, setConfig } = require('../support_files/config');
const { lslibPath, rootModPath,  gameInstallLocation } = getConfig();
const compatRootModPath = path.join(rootModPath + "\\");
const lslibToolsPath = path.join(lslibPath, TOOL_SUBDIR);

const {  } = require('../support_files/helper_functions')

const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { FIND_FILES, getFormats, dirSeparator, LOAD_LSLIB } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();
const { processPak } = require('../support_files/process_pak.js');

const { isMainThread, parentPort, Worker } = require('node:worker_threads');

const { jobs } = require('../support_files/conversion_junction');

var LSLIB;


async function lslib_load() {
    if (LSLIB === undefined) {
        bg3mh_logger.info("lslib not found. loading...");
        LSLIB = await LOAD_LSLIB();
    } else {
        bg3mh_logger.info("lslib is already loaded!");
    }
}


const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    // raiseInfo("you little fucking 💩");
    lslib_load();
    raiseInfo(`${os.platform()}`);
    
});


module.exports = { debug2 }
