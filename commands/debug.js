const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../support_files/config');

const debugCommand = vscode.commands.registerCommand('bg3-mod-helper.debugCommand', async function () {
    const config = getConfig();
    const localizationPath = path.join(config.rootModPath, 'Localization');

    try {
        // Step 1: List subdirectories
        const directories = fs.readdirSync(localizationPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        // Step 2: Show QuickPick for subdirectories
        const selectedDirectory = await vscode.window.showQuickPick(directories, {
            placeHolder: 'Select a Localization folder to merge'
        });

        if (!selectedDirectory) return;

        // Step 3: List XML files in the selected subdirectory
        const selectedDirPath = path.join(localizationPath, selectedDirectory);
        const xmlFiles = fs.readdirSync(selectedDirPath, { withFileTypes: true })
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.xml'))
            .map(dirent => dirent.name);

        // Step 4: Use QuickPick to select XML files
        const selectedFiles = await vscode.window.showQuickPick(xmlFiles, {
            canPickMany: true,
            placeHolder: 'Select XML files to merge'
        });

        if (!selectedFiles || selectedFiles.length === 0) return;

        // Step 5: Ask for save location
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(selectedDirPath, 'xml_merged.xml')),
            filters: { 'XML files': ['xml'] }
        });

        if (!uri) return;

        // Step 6: Read and merge selected XML files
        const mergedContent = selectedFiles
            .map(file => fs.readFileSync(path.join(selectedDirPath, file), 'utf8'))
            .join('\n');

        // Step 7: Save the merged file
        fs.writeFileSync(uri.fsPath, mergedContent, 'utf8');
        vscode.window.showInformationMessage('XML files merged and saved successfully!');
    } catch (error) {
        vscode.window.showErrorMessage('Error merging XML files: ' + error.message);
    }
});

module.exports = debugCommand;
