const vscode = require('vscode');
const path = require('path');

let getAttributeCommand = vscode.commands.registerCommand('bg3-mod-helper.getAttributes', async function () {
    console.log('‾‾getAttributeCommand‾‾');
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log('No active editor');
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    let filePath = editor.document.uri.fsPath;
    let fileName = path.basename(filePath);
    let url = `https://raw.githubusercontent.com/ghostboats/bg3_mod_helper/dev/reference_files/UnpackedData/Shared/Public/Shared/ClassDescriptions/${fileName}`;

    try {
        // Dynamically import the fetch module
        const fetch = (await import('node-fetch')).default;
        
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let text = await response.text();

        console.log(text);
        vscode.window.showInformationMessage(`Content fetched for ${fileName}`);
    } catch (error) {
        console.error('Failed to fetch file:', error);
        vscode.window.showErrorMessage(`Failed to fetch file: ${error.message}`);
    }
    console.log('__getAttributeCommand__');
});

module.exports = getAttributeCommand;


