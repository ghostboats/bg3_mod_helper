const path = require('path');
const vscode = require('vscode');
const { convert } = require('../support_files/conversion_junction.js');
const { dirSeparator } = require('../support_files/lslib_utils.js');

let smartConvertCommand = vscode.commands.registerCommand('bg3-mod-helper.smartConvert', async function (uri) { // Made the function async
    let temp_dir = dirSeparator(uri.path);
    let temp_ext = path.extname(temp_dir);
    console.log("%s \n%s", temp_dir, temp_ext);

    convert(temp_dir, temp_ext);
});

module.exports = smartConvertCommand;
