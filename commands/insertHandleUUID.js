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

    // Generate all handles first
    const handleData = await Promise.all(editor.selections.map(selection => {
        const selectedText = editor.document.getText(selection);
        const handle = generateHandle();
        return { selection, handle, selectedText };
    }));

    // Collect all the necessary changes for XML files
    let changes = [];
    for (const data of handleData) {
        changes.push({
            handle: data.handle,
            text: data.selectedText
        });
    }

    // Apply edits to the editor first
    await editor.edit(editBuilder => {
        for (const data of handleData) {
            editBuilder.replace(data.selection, data.handle);
        }
    });

    // Update XML files with all changes (avoid I/O conflicts)
    if (changes.length > 0) {
        await updateLocaXmlFiles(changes);
    }
});

// Function to update all .loca.xml files in the workspace with the given changes
async function updateLocaXmlFiles(changes) {
    const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!activeFilePath) {
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(activeFilePath));
    if (!workspaceFolder) {
        return;
    }

    const locaFilePattern = new vscode.RelativePattern(workspaceFolder, '**/Localization/**/*.xml');
    const locaFiles = await vscode.workspace.findFiles(locaFilePattern, '**/node_modules/**');
    if (locaFiles.length === 0) {
        vscode.window.showWarningMessage(`No .xml files found under Localization/. You can create one with the 'Create BG3 File' command.`, 'Create BG3 File').then(selection => {
            if (selection === 'Create BG3 File') {
                vscode.commands.executeCommand('bg3-mod-helper.createFileFromTemplate');
            }
        });
        return;
    }

    const edit = new vscode.WorkspaceEdit();

    let nUpdatedFiles = 0;
    for (const locaFile of locaFiles) {
        try {
            await updateLocaXmlFile(locaFile, changes, edit);
            nUpdatedFiles += 1
        } catch (error) {
            console.error(error);
        }
    }

    vscode.workspace.applyEdit(edit).then(success => {
        if (!success) {
            vscode.window.showErrorMessage('Failed to update loca .xml files.');
        } else {
            vscode.window.showInformationMessage(`Handles were added to ${nUpdatedFiles} loca .xml files.`)
        }
    });
}

// Function to update a single .loca.xml file with the given changes
async function updateLocaXmlFile(locaFileUri, changes, edit) {
    const document = await vscode.workspace.openTextDocument(locaFileUri);
    let lines = document.getText().split('\n');
    let indexToInsert = lines.findIndex(line => line.trim() === '</contentList>');
    if (indexToInsert === -1) {
        vscode.window.showWarningMessage(`No '</contentList>' tag found in ${locaFileUri.fsPath}. Handle not added to this .xml file.`, 'Open File').then(selection => {
            if (selection === 'Open File') {
                vscode.window.showTextDocument(document);
            }
        });
        throw new Error(`No '</contentList>' tag found in ${locaFileUri.fsPath}. Handle not added to this .xml file.`);
    }

    for (const change of changes) {
        edit.insert(document.uri, new vscode.Position(indexToInsert, 0), generateContent(change.handle, change.text));
    }
}

function generateContent(handle, handleContent) {
    return `    <content contentuid="${handle}" version="1">${handleContent.trim()}</content>\n`
}

function generateHandle() {
    return 'h' + uuidv4().replace(/-/g, '') + generateRandomHexWithG(4);
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
