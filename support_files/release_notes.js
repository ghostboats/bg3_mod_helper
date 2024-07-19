const vscode = require('vscode');

const showAlways = true;  // Keep this false on release

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
                    title: "Release Page Created",
                    details: [
                        "On launch of newly downloaded version of extension, launch release notes page showing newest updates, like this one :)",
                        "Removed debug toggle that shows this on all launches (todo)"
                    ]
                },
                {
                    title: "Mod Setting Changes [IMPORTANT]",
                    details: [
                        "Modname Setting Added. This value should be autoset on launch as long as you only have one folder in your rootmodpath's Mods folder. If you have multiple it will need to be set!",
                        "Configuration Options Data Provider complete, see below",
                        "Conversion exclusion list UI changes to show difference between this and packing exclusion list (todo)",
                        "Exclude Hidden (implemented but requires new lslib which is unreleased atm) setting added, possible remove as setting and make it always check files for .(todo)",
                        "Auto Launch Game and Zip options removed as settings. This is now handled via the dropdown data provider, the 'Pack and Play' and 'Pack and Zip' options respectivly.",
                        "Remove hover enabled setting to remvoe dead setting"
                    ]
                },
                {
                    title: "Configuration Options Data Provider",
                    details: [
                        "Contains several quick actions revolving around modSetting which are accessed from the data provider:",
                        "Reload Window: Will refresh the current vscode window, allowing for new settings to take effect (For example, if you change things like lslib path, you should reload)",
                        "Extension Setting: Opens the settings page, filtering the bg3 mod helper settings for quick access",
                        "Update Settings: (todo, overwrites workspace, need to confirm with beans this is the desired effect)"
                    ]
                },
                {
                    title: "Code Organization via Data Provider",
                    details: [
                        "Allows sorting of data files alphabetically (entries and/or their data values as well, user's choice)",
                        "LSX tab formatting (todo)"
                    ]
                },
                {
                    title: "Symlink Fixes",
                    details: ["Symlink will no longer create 'random' folders when linking/unlinking (seems to be working, will leave in development tag for now while users test. No errors when personally testing, please send paths/screenshots/info/etc if you have any issues)"]
                },
                {
                    title: "Zipping Fixes",
                    details: [
                        "Will now correctly zip .pak in a .zip folder (which Nexus accepts) instead of a .gz folder (which Nexus does not accept)",
                        "Zipping files is now done thru the data provider menu, expand the dropdown for packing and select Pack and Zip"
                    ]
                },
                {
                    title: "BBCode/Markdown Previewer Added",
                    details: [
                        "Test out how your mod page will look using a built-in BBCode/Markdown previewer via the Data Provider (need to add finishing touches) (todo)"
                    ]
                },
                {
                    title: "Minor Changes",
                    details: [
                        "Extension confirmed to work on Linux (ty satan!)",
                        "Check if game is lauched for linus in packing(todo)",
                        "Shortcut to PlayerProfiles Folder added in folder shortcuts",
                        "Atlas Fix if .lsx file doenst exist yet (todo)",
                        "Generate and Replace Handle option added when highlighting a handle and rightclicking"
                    ]
                }
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
