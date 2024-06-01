const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let config = {};

let rootModPath;
let vscodeDirPath;
let settingsFilePath;

// putting this here so getConfig() loads before the log_utils.js file needs it
const { raiseInfo, raiseError, CREATE_LOGGER } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER();


function stringify(jsonObj) {
    return JSON.stringify(jsonObj, null, 4)
}

// this is probably causing issues. gonna need to come up with a better solution.
function setConfig(newConfig) {
    config = newConfig;
}


function startUpConfig() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const mainFolderPath = workspaceFolders[0].uri.fsPath;

        // Update the extension configuration
        config = vscode.workspace.getConfiguration('bg3ModHelper');
        config.update('rootModPath', mainFolderPath, vscode.ConfigurationTarget.Workspace
            ).then(() => {
                initVariables();
                console.log(`root mod path set to: \n${getConfig().rootModPath}`);
                setModName(mainFolderPath);
                console.log(`mod name set to: \n${getConfig().modName}`);
                checkConfigFile();
                checkModDir();
                saveConfigFile(config);
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
        gameInstallLocation: path.normalize(config.get('gameInstallLocation')),
        modName: config.get('modName')
    };
}


function initVariables() {
    rootModPath = getConfig().rootModPath;
    vscodeDirPath = path.join(rootModPath, '.vscode');
    settingsFilePath = path.join(vscodeDirPath, 'settings.json');
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


function setModName(rootPath = getConfig().rootModPath) {
    config = vscode.workspace.getConfiguration('bg3ModHelper');

    // calling this to make sure we can save it later.
    saveConfigFile();
    
    let temp_name = config.get('modName');
    const modsDirPath = path.join(rootPath, 'Mods');

    const files = fs.readdirSync(modsDirPath);
    const directories = files.filter(file => fs.statSync(path.join(modsDirPath, file)).isDirectory());
    
    console.log(directories);

    if (directories.length === 1 && temp_name == "") {
        // console.log(`modName set to ${directories[0]}`)
        config.update('modName', directories[0], vscode.ConfigurationTarget.Workspace);
        console.log(config.get('modName'));
        saveConfigFile();
    } else {
        console.log(`modName kept as ${temp_name}`)
    }
}


function getModName() {
    config = vscode.workspace.getConfiguration('bg3ModHelper');
    return config.get('modName');
}


function checkModDir() {
    const modsDirPath = path.join(getConfig().rootModPath, 'Mods');

    bg3mh_logger.info(modsDirPath);
    console.log(modsDirPath);

    try {
        if (!fs.existsSync(modsDirPath)) {
            vscode.window.showErrorMessage('Mods directory does not exist.');
        }
    } catch (error) {
        raiseError(`Error reading directories in ${modsDirPath}: ${error}`);
    }
}


function checkConfigFile() {
    rootModPath = getConfig().rootModPath;
    vscodeDirPath = path.join(rootModPath, '.vscode');
    settingsFilePath = path.join(vscodeDirPath, 'settings.json');

    if (loadConfigFile() === undefined) {
        saveConfigFile();
    } else {
        saveConfigFile(getConfig());
    }
}


function saveConfigFile(settingsToSave = "all" || {}) {
    try {
        if (!fs.statSync(settingsFilePath).isFile()) {
            fs.mkdirSync(vscodeDirPath, { recursive: true });
        } else {
            fs.rmSync(vscodeDirPath, { recursive: true, force: true });
        }
    } catch (error) {
        console.error(error);
        // setConfig(getConfig());
    }
    
    if (settingsToSave === "all") {
        // setConfig(getConfig());
    } else {
        // setConfig(settingsToSave);
    }
    
    let settingsJson = stringify(config);

    fs.writeFileSync(settingsFilePath, settingsJson);
}


function loadConfigFile(reset = false, get = true) {
    let settingsContent;
    
    if (fs.statSync(settingsFilePath).isFile()) {
        settingsContent = fs.readFileSync(settingsFilePath, 'utf8');
        raiseInfo(settingsContent, false);

        if (reset) {
            fs.rmdirSync(vscodeDirPath, { recursive: true });
        }
        if (get) {
            return settingsContent;
        }
    } else {
        return undefined;
    }
}


module.exports = { setConfig, getConfig, getModName, loadConfigFile, saveConfigFile, checkConfigFile, setModName, checkModDir, startUpConfig };
