const vscode = require('vscode');
const path = require('path');

let config = {};

function setConfig(newConfig) {
    config = newConfig;
}


function getConfig() {
    const config = vscode.workspace.getConfiguration('bg3ModHelper');
    return {
        maxFilesToShow: config.get('hover.maxFiles'),
        hoverEnabled: config.get('hover.enabled'),
        maxCacheSize: config.get('maxCacheSize'),
        rootModPath: config.get('rootModPath'),
        modName: path.basename(config.get('rootModPath')),
        modDestPath: config.get('modDestPath'),
        lslibPath: config.get('lslibPath'),
        autoLaunchOnPack: config.get('autoLaunchOnPack'),
        launchContinueGame: config.get('launchContinueGame'),
        excludedFiles: config.get('excludedFiles') || []
    };
}
module.exports = { setConfig, getConfig };
