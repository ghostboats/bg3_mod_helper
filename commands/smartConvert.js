const path = require('path');
const vscode = require('vscode');
const { convert } = require('../support_files/conversion_junction.js');
const { dirSeparator } = require('../support_files/lslib_utils.js');

let smartConvertCommand = vscode.commands.registerCommand('bg3-mod-helper.smartConvert', async function (uri) { // Made the function async
    convert(dirSeparator(uri.path));
});

module.exports = smartConvertCommand;
