const vscode = require('vscode');
const path = require('path');
const { getConfig } = require('./config');
const fs = require('fs');

const { CREATE_LOGGER } = require('./log_utils');
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

async function getModName() {
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

module.exports = { insertText, findInstancesInWorkspace, getFullPath, getModName };