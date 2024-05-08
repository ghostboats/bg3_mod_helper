const vscode = require('vscode');

const { CREATE_LOGGER } = require('../support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

let debugCommand = vscode.commands.registerCommand('bg3-mod-helper.debugCommand', async function () { // Made the function async
    console.log('‾‾debugCommand‾‾');
    vscode.window.showWarningMessage(
        'cmon dude i said no :('
    )
    console.log('__debugCommand__');
});

module.exports = debugCommand;
