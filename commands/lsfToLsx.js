const vscode = require('vscode');
const path = require('path');

const { convert, compatRootModPath} = require('../support_files/scripts/javascript/conversion_junction.js');
const { getFormats } = require('../support_files/scripts/javascript/lslib_utils.js');

const { getConfig } = require('../support_files/config');
const { lsf, lsx } = getFormats();

let lsfToLsxCommand = vscode.commands.registerCommand('bg3-mod-helper.lsfToLsx', async function () { // Made the function async
    convert(compatRootModPath, lsf);
});

module.exports = { lsfToLsxCommand };
