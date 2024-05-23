const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { getConfig } = require('../support_files/config');
const { convert } = require('../support_files/conversion_junction.js');
const { processPak } = require('../support_files/process_pak.js')

const unpackModCommand = vscode.commands.registerCommand('bg3-mod-helper.unpackMod', async function () {
    const pakFileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { 'PAK Files': ['pak'] },
        title: 'Select a .pak file to unpack'
    });

    if (!pakFileUri) {
        vscode.window.showInformationMessage('No file selected.');
        return;
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

    const pakFilePath = pakFileUri[0].fsPath;
    const baseOutputFolderPath = outputFolderUri[0].fsPath;
    const pakFileName = path.basename(pakFilePath, path.extname(pakFilePath));

    // Create a unique folder for the unpacked contents
    const outputFolderPath = path.join(baseOutputFolderPath, `${pakFileName}_unpacked`);

    try {
        await fs.promises.mkdir(outputFolderPath, { recursive: true });
        await processPak(pakFilePath, 'n/a', outputFolderPath);
        vscode.window.showInformationMessage(`Successfully unpacked ${path.basename(pakFilePath)} to ${outputFolderPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to unpack .pak file: ${error.message}`);
    }
});