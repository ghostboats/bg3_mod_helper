const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { processPak } = require('../support_files/process_pak.js');

const unpackModCommand = vscode.commands.registerCommand('bg3-mod-helper.unpackMod', async function (fileUri) {
    let pakFilePath;

    // If the command is triggered via the context menu, use the provided URI.
    if (fileUri && fileUri.scheme === 'file') {
        pakFilePath = fileUri.fsPath;
    } else {
        // Show open dialog if not triggered via context menu
        const pakFileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: { 'PAK Files': ['pak'] },
            title: 'Select a .pak file to unpack'
        });

        if (!pakFileUri || pakFileUri.length === 0) {
            vscode.window.showInformationMessage('No file selected.');
            return;
        }

        pakFilePath = pakFileUri[0].fsPath;
    }

    const outputFolderUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: 'Select a folder to unpack the .pak file into'
    });

    if (!outputFolderUri) {
        vscode.window.showInformationMessage('No folder selected.');
        return;
    }

    const baseOutputFolderPath = outputFolderUri[0].fsPath;
    const outputFolderPath = path.join(baseOutputFolderPath, ".pak");

    try {
        await fs.promises.mkdir(outputFolderPath, { recursive: true });
        await processPak(pakFilePath, outputFolderPath);
        vscode.window.showInformationMessage(`Successfully unpacked ${path.basename(pakFilePath)} to ${outputFolderPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to unpack .pak file: ${error.message}`);
    }
});

module.exports = { unpackModCommand };
