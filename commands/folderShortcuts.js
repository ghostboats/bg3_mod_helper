const vscode = require('vscode');
const path = require('path');
const { getConfig } = require('../support_files/config');
const fs = require('fs').promises;


const openModsFolderCommand = vscode.commands.registerCommand('bg3-mod-helper.openModsFolder', () => {
    const modsFolderPath = path.join(getConfig().rootModPath, 'Mods');
    vscode.env.openExternal(vscode.Uri.file(modsFolderPath));
});

const openGameFolderCommand = vscode.commands.registerCommand('bg3-mod-helper.openGameFolder', () => {
    const gameFolderPath = getConfig().gameInstallLocation;
    vscode.env.openExternal(vscode.Uri.file(gameFolderPath));
});

const openLogsFolderCommand = vscode.commands.registerCommand('bg3-mod-helper.openLogsFolder', async () => {
    const { lslibPath } = getConfig();
    async function findLogsFolder(startPath) {
        let files = await fs.readdir(startPath, { withFileTypes: true });
        for (let file of files) {
            if (file.isDirectory()) {
                let fullPath = path.join(startPath, file.name);
                if (file.name.toLowerCase() === 'logs') {
                    return fullPath;
                }
                let foundFolder = await findLogsFolder(fullPath);
                if (foundFolder) return foundFolder;
            }
        }
        return null;
    }

    const logsFolderPath = await findLogsFolder(lslibPath);
    if (logsFolderPath) {
        vscode.env.openExternal(vscode.Uri.file(logsFolderPath));
    } else {
        vscode.window.showInformationMessage('Logs folder not found in the lslib directory.');
    }
});

const openWorkspaceFolderCommand = vscode.commands.registerCommand('bg3-mod-helper.openWorkspaceFolder', () => {
    const workspaceFolderPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
    if (workspaceFolderPath) {
        vscode.env.openExternal(vscode.Uri.file(workspaceFolderPath));
    } else {
        vscode.window.showInformationMessage('No workspace folder is open.');
    }
});

module.exports = { openModsFolderCommand, openGameFolderCommand, openLogsFolderCommand, openWorkspaceFolderCommand };