const vscode = require('vscode');
const path = require('path');

const { convert, compatRootModPath} = require('../support_files/conversion_junction.js');
const { getFormats } = require('../support_files/lslib_utils.js');

const { getConfig } = require('../support_files/config');
const { lsf, lsx } = getFormats();

let lsxToLsfCommand = vscode.commands.registerCommand('bg3-mod-helper.lsxToLsf', async function () { // Made the function async
    convert(compatRootModPath, lsx);
});

module.exports = { lsxToLsfCommand };
