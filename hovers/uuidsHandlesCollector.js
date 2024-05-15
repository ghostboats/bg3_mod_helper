const vscode = require('vscode');
const { findInstancesInWorkspace } = require('../support_files/helper_functions'); // Adjust the path as necessary
const { getConfig } = require('../support_files/config'); // Adjust the path as necessary


function escapeHtml(str) {
    console.log('Inside escapeHtml\nOriginal String: ', str,'\nEscaped Html String: ', str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setupUuidsHandlesHoverProvider() {
    return vscode.languages.registerHoverProvider({ scheme: 'file' }, {
        provideHover(document, position, token) {
            const { hoverEnabled, maxFilesToShow, maxCacheSize } = getConfig();
            if (!hoverEnabled) return;
            const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;
            const handleRegex = /h[0-9a-fg]{32}/;
            const combinedRegex = new RegExp(`${uuidRegex.source}|${handleRegex.source}`, 'i');
            let instancesCache = {};

            const range = document.getWordRangeAtPosition(position, combinedRegex);
            if (range) {
                const word = document.getText(range);
                const currentFilePath = document.uri.fsPath;

                if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                    const hoverMd = new vscode.MarkdownString('A workspace folder was not, please properly open a workspace in Visual Studio to search UUIDs/handles');
                    hoverMd.isTrusted = true;
                    return new vscode.Hover(hoverMd);
                }

                const cacheKey = `${word}:${currentFilePath}`;
                if (instancesCache[cacheKey]) {
                    const hoverMd = new vscode.MarkdownString(instancesCache[cacheKey]);
                    hoverMd.isTrusted = true;
                    return new vscode.Hover(hoverMd);
                } else {
                    return findInstancesInWorkspace(word, currentFilePath, maxFilesToShow)
                        .then(instances => {
                            if (instances.length === 0) {
                                return new vscode.Hover('No instances found, check root mod folder in settings if you expected something');
                            }

                            const hoverText = instances.map(instance => {
                                const [relativePath, lineNum, lineContent] = instance.split('#');
                                const openFileCommandUri = vscode.Uri.parse(`command:extension.openFileAtLine?${encodeURIComponent(JSON.stringify({ relativePath, lineNum }))}`);
                                let currentLine;
                                const normalizedPath = relativePath.replace(/\\/g, '/').toLowerCase();
                                console.log(relativePath)
                                console.log(normalizedPath)
                                // Check if the file is within the Localization folder
                                if (normalizedPath.includes('localization/')) {
                                    // Process as a localization-related file
                                    const contentMatch = lineContent.match(/<content[^>]*>(.*?)<\/content>/);
                                    let highlightedLineContent = contentMatch ? contentMatch[1] : '';
                                    currentLine = `Loca Content: ***${highlightedLineContent}***  \nFile: [${relativePath}](${openFileCommandUri})  \n---  \n`;
                                } else {
                                    let modifiedLineContent = lineContent.replace(/^<\/?|\/?>$/g, '');
                                    let highlightedLineContent = modifiedLineContent.replace(/(id="[^"]*")/g, '**$1**');
                                    currentLine = `Line: ${highlightedLineContent}  \nFile: [**${relativePath}**](${openFileCommandUri})  \n---  \n`;
                                }
                                return currentLine;
                            }).join('\n');

                            // Update the cache with a check for max size
                            if (Object.keys(instancesCache).length >= maxCacheSize) {
                                const keys = Object.keys(instancesCache);
                                delete instancesCache[keys[0]]; // Remove the oldest entry
                            }
                            instancesCache[cacheKey] = hoverText;

                            const hoverMd = new vscode.MarkdownString(hoverText);
                            hoverMd.isTrusted = true; // Set the MarkdownString as trusted
                            return new vscode.Hover(hoverMd);
                        })
                        .catch(error => {
                            console.error('Error finding instances:', error);
                            return new vscode.Hover('Error occurred while searching for instances');
                        });
                }
            }
        }
    });
}

module.exports = setupUuidsHandlesHoverProvider;
