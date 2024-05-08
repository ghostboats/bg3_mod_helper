const vscode = require('vscode');
const path = require('path');

const { convert} = require('../support_files/conversion_junction.js');
const { getFormats, compatRootModPath } = require('../support_files/lslib_utils.js');

const { getConfig } = require('../support_files/config');
const { lsf, lsx } = getFormats();

let lsfToLsxCommand = vscode.commands.registerCommand('bg3-mod-helper.lsfToLsx', async function () { // Made the function async
    convert(compatRootModPath, lsf);
});

module.exports = { lsfToLsxCommand };
