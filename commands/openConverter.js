
const vscode = require('vscode');

let openConverterCommand = vscode.commands.registerCommand('bg3-mod-helper.openConverter', async function () { // Made the function async
    console.log('‾‾openConverterCommand‾‾');
    openConverterView()
    console.log('__openConverterCommand__');
});

function openConverterView() {
    // Create and show a new webview
    const panel = vscode.window.createWebviewPanel(
        'converterView', // Identifies the type of the webview
        'Converter', // Title of the panel
        vscode.ViewColumn.One, // Shows the webview in the first column
        {} // Webview options
    );

    panel.webview.html = 'Put your HTML content here';
}

module.exports = openConverterCommand;
