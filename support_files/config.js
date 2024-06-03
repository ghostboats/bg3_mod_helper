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


function setConfig(newConfig = loadConfigFile()) {
    let extensionName = "bg3ModHelper";
    let working_config = vscode.workspace.getConfiguration(extensionName);

    for (let config in newConfig) {
        console.log(`config name: ${config}\nconfig value: ${newConfig[config]}`);
        working_config.update(config, newConfig[config], vscode.ConfigurationTarget.Workspace);
        
    }
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
                console.log(`root mod path set to: \n${getConfig().rootModPath}`);
                setModName(mainFolderPath);
                console.log(`mod name set to: \n${getConfig().modName}`);
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


function getConfig(config = vscode.workspace.getConfiguration('bg3ModHelper')) {
    return {
        hoverMaxFiles: config.get('hoverMaxFiles'),
        hoverEnabled: config.get('hoverEnabled'),
        hoverShowPath: config.get('hoverShowPath'),
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
    settingsFilePath = path.join(vscodeDirPath, 'settings_unparsed.json');
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
    let temp_name = config.get('modName');
    const modsDirPath = path.join(rootPath, 'Mods');

    const files = fs.readdirSync(modsDirPath);
    const directories = files.filter(file => fs.statSync(path.join(modsDirPath, file)).isDirectory());

    if (directories.length === 1 && temp_name == "") {
        // console.log(`modName set to ${directories[0]}`);
        config.update('modName', directories[0], vscode.ConfigurationTarget.Workspace);
        console.log(config.get('modName'));
    } else {
        console.log(`modName kept as ${temp_name}`)
    }
}


function getModName() {
    return config.get('modName') || config.get('bg3ModHelper.modName');
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


function saveConfigFile() {
    initVariables();

    vscodeDirPath = path.join(getConfig().rootModPath, '.vscode');
    console.log(`vscode path at ${vscodeDirPath}`);
    // console.log(`vscode settings file at${settingsFilePath}`);

    console.log("hi from saveConfigFile");
    console.log(`settings folder and file do not exist: ${(!fs.existsSync(settingsFilePath) && !fs.existsSync(vscodeDirPath))}`);
    console.log(`settings folder and file do exist: ${fs.existsSync(settingsFilePath)}`);

    if (fs.existsSync(settingsFilePath)) {
        console.log(`${settingsFilePath} exists, deleting for new save.`);
        fs.rmSync(settingsFilePath, { force: true });
        console.log(`${(!fs.existsSync(settingsFilePath) && !fs.existsSync(vscodeDirPath))}`);
    } else if (!fs.existsSync(settingsFilePath) && !fs.existsSync(vscodeDirPath)) { 
        fs.mkdirSync(vscodeDirPath);
    }

    fs.writeFileSync(settingsFilePath, stringify(config));

    // setConfig();
}


function loadConfigFile(reset = false, get = true) {
    let settingsContent;
    
    if (fs.existsSync(settingsFilePath)) {
        settingsContent = JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'));
        // raiseInfo(settingsContent, false);

        setConfig(settingsContent);

        if (reset) {
            fs.rmSync(vscodeDirPath, { recursive: true });
        }
        if (get) {
            return settingsContent;
        }
    } else if (!(fs.existsSync(settingsFilePath)) || !fs.existsSync(vscodeDirPath)) {
        saveConfigFile();
    } else {
        return undefined;
    }
}


module.exports = { setConfig, getConfig, getModName, loadConfigFile, saveConfigFile, setModName, checkModDir, startUpConfig };
