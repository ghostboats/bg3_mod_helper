import { raiseInfo } from '../support_files/log_utils';

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


const { FIND_FILES, getFormats } = require('../support_files/lslib_utils.js');
 
const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    raiseInfo("hi dipshit! 💩")

});

module.exports = { debug2 }
