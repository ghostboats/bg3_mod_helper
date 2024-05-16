const vscode = require('vscode');
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
        excludedFiles: normalizeExcludedFiles(config.get('excludedFiles'))
    };
}
module.exports = { setConfig, getConfig };
