const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let config;

let rootModPath;
let vscodeDirPath;
let settingsFilePath;
let workerSettingsFile;


// putting this here so getConfig() loads before the log_utils.js file needs it
const { CREATE_LOGGER } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER();


function stringify(file) {
    return JSON.stringify(file, null, 4);
}


function setConfig(newConfig = {} || vscode.workspace.getConfiguration("bg3ModHelper")) {
    let extensionName = "bg3ModHelper";
    let working_config = vscode.workspace.getConfiguration(extensionName);

    for (let config in newConfig) {
        working_config.update(config, newConfig[config], vscode.ConfigurationTarget.Workspace);
    }

    fs.writeFileSync(workerSettingsFile, stringify(working_config));
}


function clampPackPriority() {
    let packingPriority = "packingPriority";

    let priority = config.get(packingPriority);

    if (priority > 255) {
        priority = 255;
    }
    else if (priority < 0) {
        priority = 0;
    }

    config.update(packingPriority, priority, vscode.ConfigurationTarget.Workspace);
    bg3mh_logger.info(`packing priority set to ${priority}`);
}


function startUpConfig() {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    initVariables();

    if (workspaceFolders && workspaceFolders.length > 0) {
        const mainFolderPath = workspaceFolders[0].uri.fsPath;

        // Update the extension configuration
        config = vscode.workspace.getConfiguration('bg3ModHelper');
        config.update('rootModPath', mainFolderPath, vscode.ConfigurationTarget.Workspace
            ).then(() => {
                clampPackPriority();
                bg3mh_logger.info(`root mod path set to: \n${getConfig().rootModPath}`);
                setModName(mainFolderPath);

                vscode.window.showInformationMessage(`Workspace set to:
                ${mainFolderPath}.`,
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'bg3ModHelper');
                }
            });
            }, (error) => {
                vscode.window.showErrorMessage(`Error setting workspace: ${error}`);
            });
    }

    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(
            'bg3-mod-helper extension requires a workspace to be set for optimal functionality, one not found.'
        )
    }
}


function getConfig() {
    config = vscode.workspace.getConfiguration('bg3ModHelper');
    return {
        hoverMaxFiles: config.get('hoverMaxFiles'),
        hoverEnabled: config.get('hoverEnabled'),
        hoverShowPath: config.get('hoverShowPath'),
        maxCacheSize: config.get('general.maxCacheSize'),
        rootModPath: path.normalize(config.get('rootModPath')),
        modDestPath: path.normalize(config.get('modDestPath')),
        lslibPath: path.normalize(config.get('lslibPath')),
        autoLaunchOnPack: config.get('autoLaunchOnPack'),
        zipOnPack: config.get('zipOnPack'),
        launchContinueGame: config.get('launchContinueGame'),
        addHandlesToAllLocas: config.get('addHandlesToAllLocas'),
        excludedFiles: normalizeExcludedFiles(config.get('excludedFiles')),
        gameInstallLocation: path.normalize(config.get('gameInstallLocation')),
        modName: config.get('modName'),
        excludeHidden: config.get('excludeHidden'),
        packingPriority: config.get('packingPriority')
    };
}


function initVariables() {
    rootModPath = getConfig().rootModPath;
    vscodeDirPath = path.join(rootModPath, '.vscode');
    settingsFilePath = path.join(vscodeDirPath, 'settings.json');
    workerSettingsFile = path.join(vscodeDirPath, 'workerSettings.json')
}


function normalizeExcludedFiles(excludedFiles) {
    if (Array.isArray(excludedFiles)) {
        let normalizeExcludedFiles = excludedFiles.map((temp_file) => path.normalize(temp_file));
        return normalizeExcludedFiles;
    } else {
        return path.normalize(excludedFiles);
    }
}


function setModName(rootPath = getConfig().rootModPath) {
    let temp_name = config.get('modName');
    const modsDirPath = path.join(rootPath, 'Mods');

    const files = fs.readdirSync(modsDirPath);
    const directories = files.filter(file => fs.statSync(path.join(modsDirPath, file)).isDirectory());

    if (directories.length === 1 && temp_name == "") {
        config.update('modName', directories[0], vscode.ConfigurationTarget.Workspace);
        return directories[0];
    } else {
        bg3mh_logger.info(`modName kept as ${temp_name}`)
    }
}


function getModName() {
    return config.get('modName') || config.get('bg3ModHelper.modName');
}


function loadConfigFile(reset = false, get = true, worker = true) {
    let settingsContent;
    
    if (worker) {
        if (!fs.existsSync(workerSettingsFile)) {
            setConfig();
        }
        return JSON.parse(fs.readFileSync(workerSettingsFile, 'utf8'));
    }

    if (fs.existsSync(settingsFilePath)) {
        settingsContent = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));

        if (reset) {
            fs.rmSync(vscodeDirPath, { recursive: true });
        }
        if (get) {
            return settingsContent;
        }
    } else if (!(fs.existsSync(settingsFilePath)) || !fs.existsSync(vscodeDirPath)) {
        setConfig();
    } else {
        return undefined;
    }
}


module.exports = { 
    setConfig, 
    getConfig, 
    getModName, 
    loadConfigFile, 
    setModName, 
    startUpConfig 
};
