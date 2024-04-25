const vscode = require('vscode');
const { convert} = require('../support_files/scripts/javascript/conversion_junction.js');

let smartConvertCommand = vscode.commands.registerCommand('bg3-mod-helper.smartConvert', async function () { // Made the function async
    convert();
});

module.exports = smartConvertCommand;
