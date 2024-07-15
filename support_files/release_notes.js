const vscode = require('vscode');

const showAlways = true;  // Toggle this variable for testing

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
                        "Modname changes complete, add details here",
                        "Configuration Options Data Provider complete, add details here",
                        "New setting to add files to be excluded when packing (todo)",
                        "Conversion exclusion list UI changes to show difference between this and packing exclusion list (todo)"
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
                    details: ["Symlink will no longer create 'random' folders when linking/unlinking (todo)"]
                },
                {
                    title: "Zipping Fixes",
                    details: [
                        "Will now correctly zip .pak in a .zip folder (which Nexus accepts) instead of a .gz folder (which Nexus does not accept) (todo)"
                    ]
                },
                {
                    title: "BBCode/Markdown Previewer Added",
                    details: [
                        "Test out how your mod page will look using a built-in BBCode/Markdown previewer via the Data Provider (need to add finishing touches) (todo)"
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
