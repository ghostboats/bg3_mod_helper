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

const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { FIND_FILES, getFormats, dirSeparator } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();
const { processPak } = require('../support_files/process_pak.js');

 
const debug2 = vscode.commands.registerCommand('bg3-mod-helper.debug2Command', async function () {
    // raiseInfo("hi dipshit! 💩");
    // let test_dir = path.join(rootModPath, 'unpacking_test\\test_paks');
    let test_dir =  path.join(gameInstallLocation, 'Data');
    let unpackDest = "W:\\Libraries\\Documents\\Baldur's Gate 3 Mods\\unpacked_game_data";
    let unpackList = await FIND_FILES(pak, test_dir);

    console.log(test_dir);

    raiseInfo(unpackList);

   // for (let i = 0; i < unpackList.length; i++) {
    for await (const pakPath of unpackList) {
        //let pakPath = dirSeparator(unpackList[i]);
        //let pakPath = unpackList[i];
        let modName = path.basename(pakPath, pak);
        console.log(modName)
        //let unpackDest = dirSeparator(path.join(path.dirname(pakPath), modName));
        console.log(unpackDest);

        raiseInfo(`${modName} unpacking started`);
        // processPak(pakPath, modName, unpackDest);
        raiseInfo(`${modName} unpacking ended`);
    }

});

module.exports = { debug2 }
