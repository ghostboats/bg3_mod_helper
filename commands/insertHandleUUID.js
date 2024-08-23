const vscode = require('vscode');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { insertText } = require('../support_files/helper_functions');
const { getConfig } = require('../support_files/config');

let uuidDisposable = vscode.commands.registerCommand('bg3-mod-helper.insertUUID', function () {
    insertText(uuidv4());
});

let uuidReplaceDisposable = vscode.commands.registerCommand('bg3-mod-helper.generateReplaceAllUUIDs', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('You need to open an editor window to use this command');
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);

    // Validate the selected text as UUID
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
    if (!uuidRegex.test(selectedText)) {
        vscode.window.showErrorMessage('The selected text is not a valid UUID.');
        return;
    }

    const newUuid = uuidv4(); // Generate a new UUID
    const globalRegex = new RegExp(selectedText, 'gi'); // Global case-insensitive search
    const workspaceEdit = new vscode.WorkspaceEdit();
    let documentsToSave = new Set();

    // Search across all text files in the workspace
    const files = await vscode.workspace.findFiles('**/*.{txt,lsx,lsj}');
    for (const file of files) {
        const textDoc = await vscode.workspace.openTextDocument(file);
        const text = textDoc.getText();
        let match;
        while ((match = globalRegex.exec(text)) !== null) {
            const startPos = textDoc.positionAt(match.index);
            const endPos = textDoc.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            workspaceEdit.replace(file, range, newUuid);
            documentsToSave.add(textDoc); // Collect documents that need to be saved
        }
    }

    // Apply all collected edits
    if (await vscode.workspace.applyEdit(workspaceEdit)) {
        // Save all documents that were edited
        for (const doc of documentsToSave) {
            await doc.save();
        }
        vscode.window.showInformationMessage(`Replaced all occurrences of the UUID '${selectedText}' with '${newUuid}' and saved changes. Use undo keyboard shortcut to revert all changes back at once (dont forget to save the files if you do).`);
    } else {
        vscode.window.showErrorMessage('Failed to replace the UUIDs.');
    }
});



let handleDisposable = vscode.commands.registerCommand('bg3-mod-helper.insertHandle', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor!');
        return;
    }

    const workspaceEdit = new vscode.WorkspaceEdit();

    for (const selection of editor.selections) {
        const selectedText = editor.document.getText(selection);
        const initialHandleValue = selectedText || 'Enter initial handle content here'; // Provide a default or use selected text

        const userText = await vscode.window.showInputBox({
            value: initialHandleValue,
            prompt: "Enter initial value for the handle"
        });

        if (userText !== undefined) {
            const handle = generateHandle();
            workspaceEdit.replace(editor.document.uri, selection, handle);

            // Prepare changes for localization files
            let changes = [{
                handle: handle,
                text: userText // Using the user-entered text as the handle content
            }];

            // Update localization files with the handle
            await updateLocaXmlFiles(changes);

            // Save the updated localization files
            const locaFiles = await vscode.workspace.findFiles('**/Localization/**/*.xml');
            for (const locaFile of locaFiles) {
                const document = await vscode.workspace.openTextDocument(locaFile);
                await document.save();  // Save each localization XML file directly
            }
            
            console.log(`Handle ${handle} created with initial value: ${userText}`);
        }
    }

    if (await vscode.workspace.applyEdit(workspaceEdit)) {
        await editor.document.save(); // Save the document after making edits
        vscode.window.showInformationMessage('Handles inserted and localization files updated successfully.');
    } else {
        console.error('Apply Edit failed:', workspaceEdit);
        vscode.window.showErrorMessage('Failed to replace the handle.');
    }
});

// Command to generate and replace all handles
let handleReplaceDisposable = vscode.commands.registerCommand('bg3-mod-helper.generateReplaceAllHandles', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('You need to open an editor window to use this command');
        return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const selectedText = document.getText(selection);

    // Validate the selected text as handle
    const handleRegex = /^h[0-9a-fA-Fg]{32}[0-9a-fA-Fg]{4}$/i;
    console.log(handleRegex)
    console.log(selectedText)
    if (!handleRegex.test(selectedText)) {
        vscode.window.showErrorMessage('The selected text is not a valid handle.');
        return;
    }

    const newHandle = generateHandle();
    const globalRegex = new RegExp(selectedText, 'gi'); // Global case-insensitive search
    const workspaceEdit = new vscode.WorkspaceEdit();
    let documentsToSave = new Set();

    // Search across all text files in the workspace
    const files = await vscode.workspace.findFiles('**/*.{txt,lsx,lsj,xml}');
    for (const file of files) {
        const textDoc = await vscode.workspace.openTextDocument(file);
        const text = textDoc.getText();
        let match;
        while ((match = globalRegex.exec(text)) !== null) {
            const startPos = textDoc.positionAt(match.index);
            const endPos = textDoc.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            workspaceEdit.replace(file, range, newHandle);
            documentsToSave.add(textDoc);
        }
    }

    // Apply/save all collected edits
    if (await vscode.workspace.applyEdit(workspaceEdit)) {

        for (const doc of documentsToSave) {
            await doc.save();
        }
        vscode.window.showInformationMessage(`Replaced all occurrences of the handle '${selectedText}' with '${newHandle}' and saved changes. Use undo keyboard shortcut to revert all changes back at once (dont forget to save the files if you do).`);
    } else {
        vscode.window.showErrorMessage('Failed to replace the handles.');
    }
});

// Function to update all .loca.xml files in the workspace with the given changes
async function updateLocaXmlFiles(changes) {
    const { addHandlesToAllLocas } = getConfig();

    const activeFilePath = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!activeFilePath) {
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(activeFilePath));
    if (!workspaceFolder) {
        return;
    }

    const locaFilePattern = new vscode.RelativePattern(workspaceFolder, '**/Localization/**/*.xml');
    const locaFiles = await vscode.workspace.findFiles(locaFilePattern);
    if (locaFiles.length === 0) {
        vscode.window.showWarningMessage(`No .xml files found under Localization/. You can create one with the 'Create BG3 File' command.`, 'Create BG3 File').then(selection => {
            if (selection === 'Create BG3 File') {
                vscode.commands.executeCommand('bg3-mod-helper.createFileFromTemplate');
            }
        });
        return;
    }

    let selectedLocaFiles = locaFiles;
    // If user doesn't want to add handles to all loca files, prompt for selection from the list of all loca files
    if (!addHandlesToAllLocas && locaFiles.length > 1) {
        const fileItems = locaFiles.map(file => ({
            label: path.basename(file.fsPath),
            description: path.relative(workspaceFolder.uri.fsPath, file.fsPath),
            fileUri: file
        }));

        const selectedItems = await vscode.window.showQuickPick(fileItems, {
            canPickMany: true,
            placeHolder: 'Select .loca.xml files to update with handles'
        });

        if (!selectedItems || selectedItems.length === 0) {
            vscode.window.showInformationMessage('No .loca.xml files selected. No handles were added to any files.');
            return;
        }

        selectedLocaFiles = selectedItems.map(item => item.fileUri);
    }

    const edit = new vscode.WorkspaceEdit();

    let nUpdatedFiles = 0;
    for (const locaFile of selectedLocaFiles) {
        try {
            await updateLocaXmlFile(locaFile, changes, edit);
            nUpdatedFiles += 1;
        } catch (error) {
            console.error(error);
        }
    }

    vscode.workspace.applyEdit(edit).then(success => {
        if (!success) {
            vscode.window.showErrorMessage('Failed to update loca .xml files.');
        } else {
            vscode.window.showInformationMessage(`Handles were added to ${nUpdatedFiles} loca .xml files.`);
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
    function convertNewlinesToBr(text) {
        return text.replace(/(\\r\\n|\\n|\\r)/g, '&lt;br&gt;');
    }

    const preparedContent = convertNewlinesToBr(handleContent).trim();
    return `    <content contentuid="${handle}" version="1">${preparedContent}</content>\n`;
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
