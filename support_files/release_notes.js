const vscode = require('vscode');

const showAlways = false  // Keep this false on release

function checkForUpdates(context) {
    const extensionId = 'ghostboats.bg3-mod-helper';
    const extension = vscode.extensions.getExtension(extensionId);
    const currentVersion = extension.packageJSON.version;
    const lastVersion = context.globalState.get('lastVersion');

    if (showAlways || !lastVersion || lastVersion !== currentVersion) {
        showUpdateNotes(currentVersion, context);
        context.globalState.update('lastVersion', currentVersion);
    }
}

function showUpdateNotes(version, context) {
    const panel = vscode.window.createWebviewPanel(
        'updateNotes',
        `What's New in ${version}`,
        vscode.ViewColumn.One,
        {}
    );

    panel.webview.html = getWebviewContent(version);
}

function getWebviewContent(version) {
    const releaseNotes = generateReleaseNotes(version);
    return `
        <html>
            <head>
                <title>Update Info</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    ul {
                        list-style-type: disc;
                        padding-left: 20px;
                    }
                    ul ul {
                        list-style-type: circle;
                    }
                </style>
            </head>
            <body>
                <h1>What's New in ${version}</h1>
                ${releaseNotes}
            </body>
        </html>`;
}

function generateReleaseNotes(version) {
    const notes = [
        {
            version: version,
            features: [
                {
                    title: "Changes",
                    details: [
                        "I DONT REMEMBER, SORRY I DIDNT HAVE MY COMPUTER FOR OVER A MONTH AND FORGOT WHAT I DID"
                    ]
                },
                {
                    title: "Minor Changes",
                    details: [
                        "Json files will now be recognized for handle hovers (MCM stuff)"
                    ]
                },
                {
                    title: "Rollback Instructions",
                    details: [
                        "If you encounter any issues with this update, you can roll back to a previous version of the extension by following these steps:",
                        "1. Open the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.",
                        "2. Search for 'BG3 Mod Helper' in the Extensions view.",
                        "3. Click the gear icon next to 'BG3 Mod Helper' and select 'Install Another Version...'.",
                        "4. Choose the previous version from the list to revert to that version."
                    ]
                },
            ]
        }
    ];

    const currentNotes = notes.find(note => note.version === version);
    if (!currentNotes) {
        return `<p>No specific notes for version ${version}.</p>`;
    }

    return `<ul>${currentNotes.features.map(feature => `
        <li>
            ${feature.title}
            ${feature.details ? `<ul>${feature.details.map(detail => `<li>${detail}</li>`).join('')}</ul>` : ''}
        </li>`).join('')}
    </ul>`;
}

module.exports = {
    checkForUpdates
};
