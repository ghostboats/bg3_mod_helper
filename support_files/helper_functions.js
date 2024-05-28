const vscode = require('vscode');
const path = require('path');
const { getConfig, setConfig } = require('./config');
const fs = require('fs');

const rootModPath = getConfig().rootModPath;
const vscodeDirPath = path.join(rootModPath, '/.vscode');
const settingsFilePath = path.join(vscodeDirPath, 'settings.json');

const { CREATE_LOGGER, raiseInfo } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

// Function to insert text, replacing the current selection
function insertText(text) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.edit(editBuilder => {
            // Replace the current selection with the generated text
            editBuilder.replace(editor.selection, text);
        });
    }
}

function getFullPath(relativePath) {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        // Get the path of the first workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const workspacePath = workspaceFolder.uri.fsPath;

        // Join the workspace path with the relative path
        return path.join(workspacePath, relativePath);
    } else {
        // Handle the case where no workspace folder is open
        vscode.window.showErrorMessage('No workspace folder found. Please open a workspace folder.');
        return null; // Or handle this scenario as appropriate
    }
}

// Function to find instances in workspace
async function findInstancesInWorkspace(word, currentFilePath, maxFilesToShow) {
    bg3mh_logger.debug('‾‾findInstanceInWorkspace‾‾');
    bg3mh_logger.debug('word: ',word,'\ncurrentFilePath: ',currentFilePath,'\nmaxFilesToShow: ',maxFilesToShow);
    let instances = [];
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const workspacePath = workspaceFolder.uri.fsPath;

    let searchPath = new vscode.RelativePattern(workspacePath, '{**/*.lsx,**/*.lsj,**/*.xml,**/*.txt}');
    const excludePattern = '**/*.lsf,**/node_modules/**,**/*.loca';
    const files = await vscode.workspace.findFiles(searchPath, excludePattern);

    for (const file of files) {
        if (file.fsPath === currentFilePath) continue;
        
        const relativePath = vscode.workspace.asRelativePath(file.fsPath);
        const document = await vscode.workspace.openTextDocument(file);

        const lines = document.getText().split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(word)) {
                const found_line = lines[i].trim();
                instances.push(`${relativePath}#${i + 1}#${found_line}`);
                if (instances.length >= maxFilesToShow) break;
            }
        }
        if (instances.length >= maxFilesToShow) break;
    }
    bg3mh_logger.debug('Found Instances:\n',instances)
    bg3mh_logger.debug('__findInstanceInWorkspace__')
    return instances;
}


function saveConfigFile(settingToSave = "all") {
    let config = vscode.workspace.getConfiguration('bg3ModHelper');
    let allSettings = {
        maxFilesToShow: config.get('hover.maxFiles'),
        hoverEnabled: config.get('hover.enabled'),
        maxCacheSize: config.get('maxCacheSize'),
        rootModPath: config.get('rootModPath'),
        modDestPath: config.get('modDestPath'),
        lslibPath: config.get('lslibPath'),
        autoLaunchOnPack: config.get('autoLaunchOnPack'),
        launchContinueGame: config.get('launchContinueGame'),
        addHandlesToAllLocas: config.get('addHandlesToAllLocas'),
        excludedFiles: config.get('excludedFiles') || [],
        gameInstallLocation: config.get('gameInstallLocation')
    };

    try {
        console.log(fs.statSync(vscodeDirPath).isFile());
    } catch (error) {
        setConfig(allSettings);
        console.log(`settings set to ${allSettings}`)
    }

    if (!fs.statSync(vscodeDirPath).isFile()) {
        fs.mkdirSync(vscodeDirPath, { recursive: true });
    }
    
    if (settingToSave === "all") {
        setConfig(allSettings);
    } else { // it's gonna do something else eventually
        setConfig(allSettings);
    }
    
    let settingsJson = JSON.stringify(config, null, 4);

    fs.writeFileSync(settingsFilePath, settingsJson, 'utf8');
    raiseInfo('Initial configs set:\n' + JSON.stringify(config, null, 4), false);
}


function loadConfigFile(get = false) {
    let settingsContent;
    
    if (fs.statSync(settingsFilePath).isFile()) {
        settingsContent = fs.readFileSync(settingsFilePath, 'utf8');
        raiseInfo(settingsContent, false);

        if (get) {
            return settingsContent;
        } else {
            return undefined;
        }
    }
}

module.exports = { insertText, findInstancesInWorkspace, getFullPath, loadConfigFile, saveConfigFile };