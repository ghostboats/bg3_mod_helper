const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../support_files/config');
const xmlbuilder = require('xmlbuilder');

const xmlMergerCommand = vscode.commands.registerCommand('bg3-mod-helper.xmlMerger', async function () {
    const config = getConfig();
    const localizationPath = path.join(config.rootModPath, 'Localization');

    try {
        const directories = fs.readdirSync(localizationPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const selectedDirectory = await vscode.window.showQuickPick(directories, {
            placeHolder: 'Select a Localization folder to merge'
        });
        if (!selectedDirectory) return;

        const selectedDirPath = path.join(localizationPath, selectedDirectory);
        const xmlFiles = fs.readdirSync(selectedDirPath, { withFileTypes: true })
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.xml'))
            .map(dirent => dirent.name);

        const selectedFiles = await vscode.window.showQuickPick(xmlFiles, {
            canPickMany: true,
            placeHolder: 'Select XML files to merge'
        });
        if (!selectedFiles || selectedFiles.length === 0) return;

        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file(path.join(selectedDirPath, 'merged_xml.xml')),
            filters: { 'XML files': ['xml'] }
        });
        if (!uri) return;

        let contentsMap = {};
        for (const file of selectedFiles) {
            const filePath = path.join(selectedDirPath, file);
            const xmlData = fs.readFileSync(filePath, 'utf8');
            const contentMatches = [...xmlData.matchAll(/<content contentuid="([^"]+)" version="([^"]+)">([^<]+)<\/content>/g)];

            for (const match of contentMatches) {
                const [ , contentuid, version, text ] = match;
                if (contentsMap[contentuid]) {
                    // Prompt user to resolve duplicates
                    const selectedText = await vscode.window.showQuickPick([contentsMap[contentuid].text, text], {
                        placeHolder: `Duplicate found for contentuid: ${contentuid}. Select which one to keep.`,
                    });
                    contentsMap[contentuid] = { version, text: selectedText };
                } else {
                    contentsMap[contentuid] = { version, text };
                }
            }
        }

        let root = xmlbuilder.create('contentList');
        Object.entries(contentsMap).forEach(([contentuid, { version, text }]) => {
            root.ele('content', { contentuid, version }, text);
        });

        const mergedXml = root.end({ pretty: true });
        fs.writeFileSync(uri.fsPath, mergedXml, 'utf8');
        vscode.window.showInformationMessage('XML files merged and saved successfully!');
    } catch (error) {
        vscode.window.showErrorMessage('Error merging XML files: ' + error.message);
    }
});

module.exports = xmlMergerCommand;
