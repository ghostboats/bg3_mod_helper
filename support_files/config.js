const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let config = {};


function setConfig(newConfig) {
    config = newConfig;
}


function normalizeExcludedFiles(excludedFiles) {

    if (Array.isArray(excludedFiles)) {
        let normalizeExcludedFiles = excludedFiles.map((temp_file) => path.normalize(temp_file));
        return normalizeExcludedFiles;
    }
    else {
        return path.normalize(excludedFiles);
    }
}


function getModName() {
    const { rootModPath } = getConfig();
    const modsDirPath = path.join(rootModPath, 'Mods');

    try {
        if (!fs.existsSync(modsDirPath)) {
            vscode.window.showErrorMessage('Mods directory does not exist.');
            return '';
        }

        const files = fs.readdirSync(modsDirPath);
        const directories = files.filter(file => 
            fs.statSync(path.join(modsDirPath, file)).isDirectory()
        );

        if (directories.length === 1) {
            return directories[0];
        } else {
            return '';
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error reading directories in ${modsDirPath}: ${error}`);
        return '';
    }
}


function getConfig() {
    const config = vscode.workspace.getConfiguration('bg3ModHelper');
    return {
        maxFilesToShow: config.get('hover.maxFiles'),
        hoverEnabled: config.get('hover.enabled'),
        maxCacheSize: config.get('maxCacheSize'),
        rootModPath: path.normalize(config.get('rootModPath')),
        modDestPath: path.normalize(config.get('modDestPath')),
        lslibPath: path.normalize(config.get('lslibPath')),
        autoLaunchOnPack: config.get('autoLaunchOnPack'),
        launchContinueGame: config.get('launchContinueGame'),
        addHandlesToAllLocas: config.get('addHandlesToAllLocas'),
        excludedFiles: normalizeExcludedFiles(config.get('excludedFiles')),
        gameInstallLocation: path.normalize(config.get('gameInstallLocation'))
    };
}
module.exports = { setConfig, getConfig, getModName };
