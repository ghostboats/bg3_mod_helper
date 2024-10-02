const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { getConfig, getModName } = require('../support_files/config');

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
    bg3mh_logger.debug('word: ', word, '\ncurrentFilePath: ', currentFilePath, '\nmaxFilesToShow: ', maxFilesToShow);
    let instances = [];
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const workspacePath = workspaceFolder.uri.fsPath;

    let searchPath = new vscode.RelativePattern(workspacePath, '{**/*.lsx,**/*.lsj,**/*.xml,**/*.txt,**/*.txt}');
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
    bg3mh_logger.debug('Found Instances:\n', instances);
    bg3mh_logger.debug('__findInstanceInWorkspace__');
    return instances;
}

async function getVersionNumber() {
    const { rootModPath } = getConfig();
    const modName = await getModName();
    const modsDirPath = path.normalize(rootModPath + "\\Mods");
    const metaPath = path.normalize(modsDirPath + "\\" + modName + "\\meta.lsx");

    if (!fs.existsSync(metaPath)) {
        vscode.window.showErrorMessage('Version unable to be displayed in data provider, could not find meta.lsx.');
        return 'N/A';
    }

    try {
        let content = fs.readFileSync(metaPath, 'utf8');

        const regex = /<attribute id="Version64" type="int64" value="([^"]*)"\s*\/>/;
        const match = content.match(regex);
        const version = BigInt(match[1]);
        const major = Number((version >> BigInt(55)) & BigInt(0xFF));
        const minor = Number((version >> BigInt(47)) & BigInt(0xFF));
        const revision = Number((version >> BigInt(31)) & BigInt(0xFFFF));
        const build = Number(version & BigInt(0x7FFFFFFF));
        return `${major}.${minor}.${revision}.${build}`;
    } catch (error) {
        vscode.window.showErrorMessage("Error reading meta.lsx: " + error.message);
        return 'N/A';
    }
}

module.exports = {
    insertText,
    findInstancesInWorkspace,
    getFullPath,
    getVersionNumber
};
