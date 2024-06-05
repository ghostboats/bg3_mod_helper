const vscode = require('vscode');

const { getConfig, setConfig } = require('../support_files/config');


const saveConfigToFile = vscode.commands.registerCommand('bg3-mod-helper.saveConfigToFile', async function () {
    setConfig(getConfig());
    
});


module.exports = { saveConfigToFile }
