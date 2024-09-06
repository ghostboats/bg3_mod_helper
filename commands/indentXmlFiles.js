const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { raiseError, raiseInfo } = require('../support_files/log_utils');
const { getConfig, loadConfigFile, setModName, setConfig } = require('../support_files/config');
const builder = require('xmlbuilder');

async function indentXmlFiles() {
    const config = getConfig();
    const rootModPath = config.rootModPath;
    const indentLevel = await vscode.window.showInputBox({
        prompt: 'Enter the number of spaces for indentation',
        validateInput: (value) => {
            const num = parseInt(value, 10);
            return isNaN(num) || num < 0 ? 'Please enter a valid non-negative number' : null;
        }
    });

    if (!indentLevel) {
        return; // User cancelled the input box
    }

    const findFiles = (dir, extensions, fileList = []) => {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                // Skip the Localization folder
                if (path.basename(filePath).toLowerCase() !== 'localization') {
                    fileList = findFiles(filePath, extensions, fileList);
                }
            } else if (extensions.some(ext => filePath.endsWith(ext))) {
                fileList.push(filePath);
            }
        });
        return fileList;
    };

    const files = findFiles(rootModPath, ['.lsx', '.lsj']);

    for (const filePath of files) {
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        // Remove BOM if it exists
        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1);
        }
        try {
            const doc = builder.create(fileContent, { headless: true });
            const formattedContent = doc.end({ pretty: true, indent: ' '.repeat(parseInt(indentLevel, 10)) });
            fs.writeFileSync(filePath, formattedContent, 'utf-8');
            raiseInfo(`File ${filePath} has been formatted with an indent level of ${indentLevel} spaces.`);
        } catch (error) {
            raiseError(`Failed to process file ${filePath}: ${error.message}`);
        }
    }

    raiseInfo('XML files formatting process completed.');
}

const indentXmlFilesCommand = vscode.commands.registerCommand('bg3-mod-helper.indentXmlFilesCommand', async function () {
    await indentXmlFiles();
});

module.exports = { indentXmlFilesCommand };
