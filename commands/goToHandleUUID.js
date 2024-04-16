const vscode = require('vscode');
const path = require('path');

const { findInstancesInWorkspace, getFullPath } = require('../support_files/helper_functions');
const { getConfig } = require('../support_files/config');


let goToHandleUuidCommand = vscode.commands.registerCommand('bg3-mod-helper.goToHandleUUID', async () => {
    const { maxFilesToShow } = getConfig();
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = editor.selection.active;
        const range = editor.document.getWordRangeAtPosition(position, /[\w\-]+/);

        if (range) {
            const word = editor.document.getText(range).trim();
            const currentFilePath = editor.document.uri.fsPath;

            console.log(`Current word: ${word}`);
            console.log(`Current file path: ${currentFilePath}`);

            if (isHandleOrUUID(word)) {
                if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                    vscode.window.showWarningMessage(
                        'bg3-mod-helper extension requires a workspace to be set for optimal functionality. Please properly have a workspace set'
                    );
                    return;
                }

                console.log(`Finding instances in workspace for: ${word}`);
                const instances = await findInstancesInWorkspace(word, currentFilePath, maxFilesToShow);
                console.log(`Instances found: ${instances.length}`);

                if (instances.length > 0) {
                    const picked = await vscode.window.showQuickPick(instances.map(instance => instance.split('#').slice(0, 2).join(':')), {
                        placeHolder: 'Select a file to open'
                    });

                    if (picked) {
                        console.log(`Picked instance: ${picked}`);
                        const [relativePath, lineString] = picked.split(':');
                        const line = parseInt(lineString, 10) - 1;
                        console.log(`Relative Path: ${relativePath}`);
                        if (!isNaN(line)) {
                            const fullPath = getFullPath(relativePath)
                            console.log(`Full path of picked file: ${fullPath}`);

                            const uri = vscode.Uri.file(fullPath);

                            vscode.window.showTextDocument(uri, { preview: false }).then(doc => {
                                const text = doc.document.lineAt(line).text;
                                const start = text.indexOf(word);
                                const end = start + word.length;

                                if (start >= 0) {
                                    console.log(`Highlighting word in document: ${word}`);
                                    const highlightRange = new vscode.Range(line, start, line, end);
                                    doc.selection = new vscode.Selection(highlightRange.start, highlightRange.end);
                                    doc.revealRange(highlightRange, vscode.TextEditorRevealType.InCenter);
                                }
                            });
                        } else {
                            console.error(`Error parsing line number from '${picked}'`);
                        }
                    }
                } else {
                    console.log('No instances found.');
                    vscode.window.showInformationMessage('No instances found, check your root mod folder in settings if you expected something');
                }
            } else {
                console.log('Text under cursor is not a valid UUID/Handle.');
                vscode.window.showWarningMessage('Text under cursor is not a valid UUID/Handle');
            }
        }
    }
});

// Function to check if a string is a UUID or handle
function isHandleOrUUID(word) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const handleRegex = /^h[0-9a-fg]{36}$/;
    return uuidRegex.test(word) || handleRegex.test(word);
}