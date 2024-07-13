const vscode = require('vscode');

// This function checks for updates and shows the release notes if there's a new version. Make sure to update the webview
//when making new releases
function checkForUpdates(context) {
    const extensionId = 'ghostboats.bg3-mod-helper';
    const extension = vscode.extensions.getExtension(extensionId);
    const currentVersion = extension.packageJSON.version;
    const lastVersion = context.globalState.get('lastVersion');

    if (!lastVersion || lastVersion !== currentVersion) {
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
    // Dynamically create the content based on the version here, maybe will use a file later in future
    const releaseNotes = `Here are the new features in version ${version}:<ul><li>New feature 1</li><li>New feature 2</li></ul>`;
    return `
        <html>
            <head><title>Update Info</title></head>
            <body>
                <h1>What's New in ${version}</h1>
                <p>${releaseNotes}</p>
            </body>
        </html>`;
}

module.exports = {
    checkForUpdates
};
