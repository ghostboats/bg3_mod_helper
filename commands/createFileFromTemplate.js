const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { insertText } = require('../support_files/helper_functions');
const { getConfig } = require('../support_files/config');


let createFileFromTemplateCommand = vscode.commands.registerCommand('bg3-mod-helper.createFileFromTemplate', () => {
    const templates = require('../support_files/templates/skeleton_files');
    const templateNames = Object.keys(templates);

    vscode.window.showQuickPick(templateNames, {
        placeHolder: 'Type to filter templates...',
        matchOnDetail: true
    }).then(selectedTemplateName => {
        if (selectedTemplateName) {
            const templatePath = templates[selectedTemplateName];

            // Debugging: Log the full path
            const fullPath = path.join(__dirname, templatePath);
            console.log(`Full path to template: ${fullPath}`);

            let fileContent;

            if (templatePath.endsWith('.lsx')) {
                // Read file content if it's a .lsx file
                fileContent = fs.readFileSync(path.join(__dirname, templatePath), 'utf8');
            } else {
                // Handle other templates as before
                fileContent = templates[selectedTemplateName];
            }

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const filePath = path.join(workspaceFolders[0].uri.fsPath, selectedTemplateName);
                const fileUri = vscode.Uri.file(filePath);
    
                vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent)).then(() => {
                    vscode.window.showInformationMessage(`${selectedTemplateName} created successfully.`);
                    vscode.window.showTextDocument(fileUri);
                }, err => {
                    vscode.window.showErrorMessage(`Error creating ${selectedTemplateName}: ${err}`);
                });
            } else {
                vscode.window.showErrorMessage('No workspace folder found.');
            }
        }
    });
});

let insertAttributeCommand = vscode.commands.registerCommand('bg3-mod-helper.insertAttribute', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const text = editor.document.getText();
    const attributeLines = extractAttributeLines(text, '<!--press control shift a to quick spawn a line below', 'end custom attribute lines-->');
    if (attributeLines.length === 0) {
        vscode.window.showInformationMessage('No custom attributes found.');
        return;
    }
    
    vscode.window.showQuickPick(attributeLines).then(selectedLine => {
        if (selectedLine) {
        insertText(selectedLine);
        }
    });
});

let insertClipboardCommand = vscode.commands.registerCommand('bg3-mod-helper.insertClipboard', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const text = editor.document.getText();
    const clipboardLines = extractAttributeLines(text, '<!--press control shift 2 to quick spawn a line below', 'end ctrl shift 2 clipboard-->');
    if (clipboardLines.length === 0) {
        vscode.window.showInformationMessage('No clipboard content found.');
        return;
    }
    
    vscode.window.showQuickPick(clipboardLines).then(selectedLine => {
        if (selectedLine) {
            insertText(selectedLine);
        }
    });
});

function extractAttributeLines(text, startDelimiter, endDelimiter) {
    const lines = text.split('\n');
    const start = lines.findIndex(line => line.includes(startDelimiter));
    const end = lines.findIndex(line => line.includes(endDelimiter), start);
    if (start === -1 || end === -1 || start >= end) return [];
    return lines.slice(start + 1, end);
}