const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { raiseError, raiseInfo } = require('../support_files/log_utils');
const { getConfig, loadConfigFile, setModName, setConfig } = require('../support_files/config');

function sortEntriesInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const entries = fileContent.split(/(?:\r\n|\r|\n)(?=new entry )/).filter(entry => entry.trim() !== '');

    const sortedEntries = entries.map(entry => {
        const lines = entry.split(/(?:\r\n|\r|\n)/).filter(line => line.trim() !== '');
        const newEntry = lines.shift(); // Extract "new entry" line
        const typeLine = lines.shift(); // Extract "type" line
        let usingLine = '';
        const dataLines = lines.filter(line => {
            if (line.startsWith('using ')) {
                usingLine = line;
                return false;
            }
            return true;
        }).sort(); // Sort data lines alphabetically

        // Construct the sorted entry
        return `${newEntry}\r\n${typeLine}\r\n${usingLine ? usingLine + '\r\n' : ''}${dataLines.join('\r\n')}`;
    });

    const sortedContent = sortedEntries.join('\r\n\r\n');

    // Write sorted content to a temporary file
    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    fs.writeFileSync(tempFilePath, sortedContent);

    return { sortedContent, tempFilePath };
}

async function autoSortFiles() {
    const config = getConfig();
    const rootModPath = config.rootModPath;
    const modName = config.modName;
    let saveAll = false;
    let closeRemaining = false;

    const statsPath = path.join(rootModPath, 'Public', modName, 'Stats', 'Generated', 'Data');

    if (!fs.existsSync(statsPath)) {
        raiseError(`Data directory does not exist: ${statsPath}`);
        vscode.window.showErrorMessage(`Data directory does not exist: ${statsPath}`);
        return;
    }

    fs.readdir(statsPath, async (err, files) => {
        if (err) {
            raiseError(`Failed to read directory: ${err.message}`);
            vscode.window.showErrorMessage(`Failed to read directory: ${err.message}`);
            return;
        }

        for (const file of files) {
            if (closeRemaining) {
                break;
            }

            const filePath = path.join(statsPath, file);
            const result = sortEntriesInFile(filePath);

            if (result) {
                const { sortedContent, tempFilePath } = result;
                const leftUri = vscode.Uri.file(filePath);
                const rightUri = vscode.Uri.file(tempFilePath);
                const title = `Compare: ${path.basename(filePath)}`;

                await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title);

                if (saveAll) {
                    fs.writeFileSync(filePath, sortedContent);
                    raiseInfo(`File ${filePath} has been overwritten with sorted content.`);
                } else {
                    const confirm = await vscode.window.showInformationMessage(
                        `Do you want to overwrite the original file with the sorted content for ${path.basename(filePath)}?`,
                        'Save', 'Close', 'Save Remaining', 'Close Remaining'
                    );

                    if (confirm === 'Save') {
                        fs.writeFileSync(filePath, sortedContent);
                        raiseInfo(`File ${filePath} has been overwritten with sorted content.`);
                    } else if (confirm === 'Save Remaining') {
                        saveAll = true;
                        fs.writeFileSync(filePath, sortedContent);
                        raiseInfo(`File ${filePath} has been overwritten with sorted content.`);
                    } else if (confirm === 'Close Remaining') {
                        closeRemaining = true;
                        raiseInfo(`Process terminated by user.`);
                        return;
                    } else {
                        raiseInfo(`File ${filePath} was not overwritten.`);
                    }
                }
            }
        }

        raiseInfo('File sorting process completed.');
    });
}

const organizeDataFiles = vscode.commands.registerCommand('bg3-mod-helper.organizeDataFilesCommand', async function () {
    await autoSortFiles();
});

module.exports = { organizeDataFiles };