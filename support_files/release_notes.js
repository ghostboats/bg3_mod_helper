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
                    title: "Assets Metadata.lsx button",
                    details: [
                        "Added Assets Metadata.lsx Creation (I know my naming scheme sucks )button that will create a metadata.lsx \nfile based on your pngs/DDS files in your GUI/Assets folders and subfolders."
                    ]
                },
                {
                    title: "Handle Entry Fixes",
                    details: [
                        "Sorry i think I messed something up in a previous handle update. I have swapped around the \ncommands for insertHandle and insertHandleDisposable. Basically this should be that \n when you hit control shift h it will prompt for an intial handle. \nIf you right click you will see Generate Handle which will make a handle but not entry now."
                    ]
                },
                {
                    title: "Dependencies Changes",
                    details: [
                        "Add Dependency button should now correctly check your modsettings list (for all profiles) and \ngive you quick access to add them in as dependencies to the mod you are working on."
                    ]
                },
                {
                    title: "Minor Changes",
                    details: [
                        "Your mod version now shows in the quick actions next to the version generator button(needs a \nreload of vscode if you update it to update the ui).",
                        "1 second delay if bg3 is open when reopening on pak and play to allow for proper closing and reopening of the game."
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
