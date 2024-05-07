const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('util');

const { exec } = require('child_process')
const execAsync = util.promisify(require('child_process').exec);

const { convert } = require('../support_files/conversion_junction.js');

const { getFormats } = require('../support_files/lslib_utils.js');
const { loca, xml } = getFormats();
const { getConfig } = require('../support_files/config');
const { modName, rootModPath,  } = getConfig();


const xmlToLocaCommand = vscode.commands.registerCommand('bg3-mod-helper.xmlToLoca', async function () {

    convert(rootModPath, xml);

});
