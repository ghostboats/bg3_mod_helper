const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

let config = {};

function setConfig(newConfig) {
    config = newConfig;
}


function getConfig() {
    const config = vscode.workspace.getConfiguration('bg3ModHelper');
    const rootModPath = path.normalize(config.get('rootModPath'));
    return {
        maxFilesToShow: config.get('hover.maxFiles'),
        hoverEnabled: config.get('hover.enabled'),
        maxCacheSize: config.get('maxCacheSize'),
        rootModPath: rootModPath,
        modName: getModName(rootModPath),
        modDestPath: path.normalize(config.get('modDestPath')),
        lslibPath: path.normalize(config.get('lslibPath')),
        autoLaunchOnPack: config.get('autoLaunchOnPack'),
        launchContinueGame: config.get('launchContinueGame'),
        excludedFiles: config.get('excludedFiles') || []
    };
}

function getModName(rootModPath) {
    const modsPath = path.join(rootModPath, 'Mods');
    try {
        const directories = fs.readdirSync(modsPath, { withFileTypes: true })
                            .filter(dirent => dirent.isDirectory())
                            .map(dirent => dirent.name);
        return directories[0] || ''; // Return the first directory name or an empty string if no directories are found
    } catch (err) {
        console.error(`Error reading directories from ${modsPath}: ${err}`);
        return ''; // Return an empty string in case of an error
    }
}

module.exports = { setConfig, getConfig };
