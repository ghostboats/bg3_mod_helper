const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('util');

const { exec } = require('child_process')
const execAsync = util.promisify(require('child_process').exec);

const { convert} = require('../support_files/conversion_junction.js');

const { getFormats, compatRootModPath } = require('../support_files/lslib_utils.js');
const { loca, xml } = getFormats();

const locaToXmlCommand = vscode.commands.registerCommand('bg3-mod-helper.locaToXml', async function () {

    convert(compatRootModPath, loca);

});