const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getConfig, getModName } = require('../support_files/config');
const { CREATE_LOGGER } = require('../support_files/log_utils.js');


const bg3mh_logger = CREATE_LOGGER();

let versionGeneratorCommand = vscode.commands.registerCommand('bg3-mod-helper.versionGenerator', function () {
    bg3mh_logger.info('‾‾versionGeneratorCommand‾‾');
    const panel = vscode.window.createWebviewPanel(
        'versionGenerator',
        'Version Generator',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === 'copyToClipboard') {
            vscode.env.clipboard.writeText(message.text).then(() => {
                vscode.window.showInformationMessage('Version number copied to clipboard!');
            });
        } else if (message.command === 'addToMeta') {
            await addToMeta(message.version);
        }
    });

    bg3mh_logger.info('__versionGeneratorCommand__');
});

async function addToMeta(version) {
    bg3mh_logger.info('Updating Version64 in meta.lsx');
    const { rootModPath } = getConfig();
    const modName = await getModName();
    const modsDirPath = path.normalize(rootModPath + "\\Mods");
    const metaPath = path.normalize(modsDirPath + "\\" + modName + "\\meta.lsx");
    if (!fs.existsSync(metaPath)) {
        vscode.window.showErrorMessage(`Meta file not found at ${metaPath}`);
        return;
    }

    try {
        let content = fs.readFileSync(metaPath, 'utf8');
        const regex = /<attribute id="Version64" type="int64" value="[^"]*"\s*\/>/g;
        const updatedContent = content.replace(regex, `<attribute id="Version64" type="int64" value="${version}" />`);

        if (content === updatedContent) {
            vscode.window.showErrorMessage('Version64 attribute not found in meta.lsx');
        } else {
            fs.writeFileSync(metaPath, updatedContent, 'utf8');
            vscode.window.showInformationMessage('Version64 attribute updated successfully!');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error updating meta.lsx: ${error.message}`);
    }
}

function getWebviewContent() {
    const nonce = getNonce();
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Version Generator</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background-color: #1e1e1e;
                color: #d4d4d4;
            }
            .field {
                margin-bottom: 15px;
            }
            label {
                cursor: pointer;
                display: block;
                margin-bottom: 5px;
            }
            .number-input {
                display: flex;
                align-items: center;
            }
            .number-input input[type="number"] {
                width: 60px;
                text-align: right;
                padding: 5px;
                border: 1px solid #3c3c3c;
                border-radius: 4px;
                background-color: #2d2d2d;
                color: #d4d4d4;
                -moz-appearance: textfield;
            }
            .number-input input::-webkit-outer-spin-button,
            .number-input input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            .spinner-buttons {
                display: flex;
                flex-direction: column;
                margin-left: 2px;
            }
            .spinner-button {
                background-color: #007acc;
                color: white;
                border: none;
                padding: 3px;
                cursor: pointer;
                outline: none;
                font-size: 10px;
            }
            .spinner-button:active {
                background-color: #005f99;
            }
            .button {
                background-color: #007acc;
                color: white;
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            .button:hover {
                background-color: #005f99;
            }
            .text-input {
                width: 100%;
                padding: 5px;
                border: 1px solid #3c3c3c;
                border-radius: 4px;
                background-color: #2d2d2d;
                color: #d4d4d4;
            }
        </style>
    </head>
    <body>
        <h1>Version Generator</h1>
        <div class="field">
            <label for="major">Major:</label>
            <div class="number-input">
                <input type="number" id="major" value="0" min="0">
                <div class="spinner-buttons">
                    <button class="spinner-button" onclick="increment('major')">▲</button>
                    <button class="spinner-button" onclick="decrement('major')">▼</button>
                </div>
            </div>
        </div>
        <div class="field">
            <label for="minor">Minor:</label>
            <div class="number-input">
                <input type="number" id="minor" value="0" min="0">
                <div class="spinner-buttons">
                    <button class="spinner-button" onclick="increment('minor')">▲</button>
                    <button class="spinner-button" onclick="decrement('minor')">▼</button>
                </div>
            </div>
        </div>
        <div class="field">
            <label for="revision">Revision:</label>
            <div class="number-input">
                <input type="number" id="revision" value="0" min="0">
                <div class="spinner-buttons">
                    <button class="spinner-button" onclick="increment('revision')">▲</button>
                    <button class="spinner-button" onclick="decrement('revision')">▼</button>
                </div>
            </div>
        </div>
        <div class="field">
            <label for="build">Build:</label>
            <div class="number-input">
                <input type="number" id="build" value="0" min="0">
                <div class="spinner-buttons">
                    <button class="spinner-button" onclick="increment('build')">▲</button>
                    <button class="spinner-button" onclick="decrement('build')">▼</button>
                </div>
            </div>
        </div>
        <div class="field">
            <label for="version">Version 64-bit:</label>
            <input type="text" id="version" class="text-input" value="0">
        </div>
        <div class="field">
            <button class="button" id="copyButton">Copy Version</button>
            <button class="button" id="resetButton">Reset</button>
            <button class="button" id="addToMetaButton">Add To Meta</button>
        </div>
        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();

            function createVersion64(major, minor, revision, build) {
                const majorBigInt = BigInt(major);
                const minorBigInt = BigInt(minor);
                const buildBigInt = BigInt(build);
                const revisionBigInt = BigInt(revision);

                const version64 = (majorBigInt << BigInt(55)) | (minorBigInt << BigInt(47)) | (revisionBigInt << BigInt(31)) | buildBigInt;

                return version64.toString();
            }

            function reversePopulateFields(version64) {
                try {
                    const version = BigInt(version64);

                    const major = Number((version >> BigInt(55)) & BigInt(0xFF));
                    const minor = Number((version >> BigInt(47)) & BigInt(0xFF));
                    const revision = Number((version >> BigInt(31)) & BigInt(0xFFFF));
                    const build = Number(version & BigInt(0x7FFFFFFF));

                    document.getElementById('major').value = major;
                    document.getElementById('minor').value = minor;
                    document.getElementById('revision').value = revision;
                    document.getElementById('build').value = build;

                    updateVersion();
                } catch (error) {
                    console.error('Invalid version64 input:', error);
                }
            }

            function updateVersion() {
                const major = document.getElementById('major').value;
                const minor = document.getElementById('minor').value;
                const revision = document.getElementById('revision').value;
                const build = document.getElementById('build').value;
                const version = createVersion64(major, minor, revision, build);
                document.getElementById('version').value = version;

                // Save current state
                vscode.setState({ major, minor, revision, build, version });
            }

            function resetFields() {
                document.getElementById('major').value = 0;
                document.getElementById('minor').value = 0;
                document.getElementById('revision').value = 0;
                document.getElementById('build').value = 0;
                updateVersion();
            }

            function increment(id) {
                const input = document.getElementById(id);
                input.stepUp();
                updateVersion();
            }

            function decrement(id) {
                const input = document.getElementById(id);
                input.stepDown();
                updateVersion();
            }

            document.getElementById('major').addEventListener('input', updateVersion);
            document.getElementById('minor').addEventListener('input', updateVersion);
            document.getElementById('revision').addEventListener('input', updateVersion);
            document.getElementById('build').addEventListener('input', updateVersion);

            document.getElementById('version').addEventListener('input', (e) => {
                const version64 = e.target.value;
                reversePopulateFields(version64);
            });

            document.getElementById('copyButton').addEventListener('click', () => {
                const version = document.getElementById('version').value;
                vscode.postMessage({ command: 'copyToClipboard', text: version });
            });

            document.getElementById('resetButton').addEventListener('click', resetFields);

            document.getElementById('addToMetaButton').addEventListener('click', () => {
                const version = document.getElementById('version').value;
                vscode.postMessage({ command: 'addToMeta', version: version });
            });

            document.querySelectorAll('label[for]').forEach(label => {
                label.addEventListener('click', () => {
                    document.getElementById(label.getAttribute('for')).focus();
                });
            });

            // Restore saved state if available
            const state = vscode.getState();
            if (state) {
                document.getElementById('major').value = state.major;
                document.getElementById('minor').value = state.minor;
                document.getElementById('revision').value = state.revision;
                document.getElementById('build').value = state.build;
                document.getElementById('version').value = state.version;
            } else {
                updateVersion();
            }
        </script>
    </body>
    </html>
    `;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

module.exports = versionGeneratorCommand;
