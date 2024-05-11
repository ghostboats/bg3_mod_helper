const vscode = require('vscode');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { insertText } = require('../support_files/helper_functions');
const { getConfig } = require('../support_files/config');


let uuidDisposable = vscode.commands.registerCommand('bg3-mod-helper.insertUUID', function () {
    insertText(uuidv4());
});

let handleDisposable = vscode.commands.registerCommand('bg3-mod-helper.insertHandle', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor!');
        return;
    }

    const { customWorkspacePath } = getConfig();
    // Generate a handle for each selection (cursor)
    const handles = await Promise.all(editor.selections.map(() => generateHandle(customWorkspacePath)));

    // Insert the handles into the editor for each selection
    editor.edit((editBuilder) => {
        editor.selections.forEach((selection, index) => {
            editBuilder.replace(selection, handles[index]);
        });
    });
});

// Function to generate a handle with 'g' included and update .loca.xml file
async function generateHandle(customWorkspacePath) {
    let tempHandle = 'h' + uuidv4().replace(/-/g, '') + generateRandomHexWithG(4);
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(
            'bg3-mod-helper extension requires a workspace to be set for optimal functionality. Please properly have a workspace set'
        );
        return;
    }
    // Get the path of the currently active file
    const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (activeFilePath) {
        // Determine the workspace folder
        let workspaceFolder;
        const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
        workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(activeFilePath));

        if (workspaceFolder) {
            // Find .loca.xml file in the workspace folder
            const locaFilePattern = new vscode.RelativePattern(workspaceFolder, '**/Localization/**/*.xml');
            const locaFiles = await vscode.workspace.findFiles(locaFilePattern, '**/node_modules/**', 1);

            if (locaFiles.length == 1) {
                // Update the first .loca.xml file found
                const document = await vscode.workspace.openTextDocument(locaFiles[0]);
                let lines = document.getText().split('\n');

                let indexToInsert = lines.findIndex(line => line.trim() === '</contentList>');
                if (indexToInsert !== -1) {
                    const contentToAdd = `    <content contentuid="${tempHandle}" version="1"></content>\n`;
                    const edit = new vscode.WorkspaceEdit();
                    const position = new vscode.Position(indexToInsert, 0);
                    edit.insert(document.uri, position, contentToAdd);
                    await vscode.workspace.applyEdit(edit);

                    // Show notification with a button to open the updated .loca.xml file
                    vscode.window.showInformationMessage('A new handle was created in your .xml file.', 'Open File').then(selection => {
                        if (selection === 'Open File') {
                            vscode.window.showTextDocument(document.uri, { preview: false });
                        }
                    });
                }
            } else {
                vscode.window.showWarningMessage(
                    'Either no .xml files found in Localization/*/ or more then 1 was found. Handle not added to .xml file. Maybe you have a .loca.xml file?'
                );
            }
        }
    }

    return tempHandle;
}

// Function to generate random hexadecimal characters with 'g' included
function generateRandomHexWithG(length) {
    const hexCharsWithG = '0123456789abcdefg';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += hexCharsWithG.charAt(Math.floor(Math.random() * hexCharsWithG.length));
    }
    return result;
}