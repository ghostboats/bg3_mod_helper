const vscode = require('vscode');

let debugCommand = vscode.commands.registerCommand('bg3-mod-helper.debugCommand', async function () { // Made the function async
    console.log('‾‾debugCommand‾‾');
    vscode.window.showWarningMessage(
        'cmon dude i said no :('
    )
    console.log('__debugCommand__');
});

module.exports = debugCommand;
