const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('util');

const { exec } = require('child_process')
const execAsync = util.promisify(require('child_process').exec);

const { convert } = require('../support_files/conversion_junction.js');

const { getFormats } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();
const { getConfig } = require('../support_files/config');
const { rootModPath } = getConfig();


const unpackModCommand = vscode.commands.registerCommand('bg3-mod-helper.unpackMod', async function () {
    const { getModName } = require('../support_files/helper_functions');
    let modName = await getModName();

    console.log(`Unpacking mod ${modName}.`)

    convert(path.join(rootModPath, modName + pak));

});
