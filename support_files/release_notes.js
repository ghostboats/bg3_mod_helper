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
                    title: "Release Page Created",
                    details: [
                        "On launch of newly downloaded version of extension, launch release notes page showing newest updates, like this one :)"
                    ]
                },
                {
                    title: "Mod Setting Changes [IMPORTANT]",
                    details: [
                        "Modname Setting Added. This value should be autoset on launch as long as you only have one folder in your rootmodpath's Mods folder. If you have multiple it will need to be set!",
                        "Configuration Options Data Provider complete, see below",
                        "Conversion exclusion list UI changes to show difference between this and packing exclusion list",
                        "Exclude Hidden (implemented but requires new lslib which is unreleased atm) setting added, possible remove as setting and make it always check files for .",
                        "Auto Launch Game and Zip options removed as settings. This is now handled via the dropdown data provider, the 'Pack and Play' and 'Pack and Zip' options respectivly.",
                        "Remove hover enabled setting to remvoe dead setting",
                        "Setting added to close the existing bg3 instance when you pack and play for quicker launch if you forgot to close. By default it is off.",
                        "If you have a unique mod destination path, the prompt will now only appear one time per session to avoid having to confirm each time on pack"
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
                        "Allows sorting of data files alphabetically (data values sorted for entries, not sorting the entries themselves but that will be added in the future)",
                        "LSX tab formatting (todo)"
                    ]
                },
                {
                    title: "Symlink Fixes",
                    details: [
                        "SYMLINKER DISABLED DUE TO CATASTROPHIC FAILURE. IF YOU USED IT BEFORE WITHOUT PROBLEMS, LET ME KNOW AND I CAN GIVE A VERSION THAT HAS IT ENABLED.",
                        "Symlink will no longer create 'random' folders when linking/unlinking (seems to be working, will leave in development tag for now while users test. No errors when personally testing, please send paths/screenshots/info/etc if you have any issues)"
                    ]
                },
                {
                    title: "Zipping Fixes",
                    details: [
                        "Will now correctly zip .pak in a .zip folder (which Nexus accepts) instead of a .gz folder (which Nexus does not accept)",
                        "Zipping files is now done thru the data provider menu, expand the dropdown for packing and select Pack and Zip",
                        "Zipped files appear in correct location now",
                        "Pak file is deleted now if zip is made"
                    ]
                },
                {
                    title: "BBCode/Markdown Previewer Added",
                    details: [
                        "Test out how your mod page will look using a built-in BBCode/Markdown previewer via the Data Provider (needs more work)"
                    ]
                },
                {
                    title: "Minor Changes",
                    details: [
                        "",
                        "Extension confirmed to work on Linux (ty satan!)",
                        "Check if game is lauched for linus in packing(todo)",
                        "Shortcut to PlayerProfiles Folder added in folder shortcuts",
                        "Atlas Fix if .lsx file doenst exist yet",
                        "Generate and Replace Handle option added when highlighting a handle and rightclicking",
                        "Generate Handle will now correctly save the xml files it adds it to",
                        "Disable button (scrapped, vscode doesnt have a way to disable via api i guess?)"
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
