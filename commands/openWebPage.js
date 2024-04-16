const vscode = require('vscode');

let openWebPageCommand = vscode.commands.registerCommand('bg3-mod-helper.openWebPage', function () {
    openWebPage();
});

// Command for opening Stats Validator
let openStatsValidatorCommand = vscode.commands.registerCommand('bg3-mod-helper.openStatsValidator', function () {
    copySelectedText();
    openWebPage('https://bg3.norbyte.dev/stats-validator', 'BG3 Stats Validator');
});

// Command for opening LSX Validator
let openLSXValidatorCommand = vscode.commands.registerCommand('bg3-mod-helper.openLSXValidator', function () {
    copySelectedText();
    openWebPage('https://bg3.norbyte.dev/lsx-validator', 'BG3 LSX Validator');
});

// Command for opening BG3 Search Engine
let openBG3SearchEngineCommand = vscode.commands.registerCommand('bg3-mod-helper.openBG3SearchEngine', function () {
    copySelectedText();
    openWebPage('https://bg3.norbyte.dev/search', 'BG3 Search Engine');
});

function openWebPage(url, title) {
    const panel = vscode.window.createWebviewPanel(
        'webPageView', // Identifies the type of the webview. Used internally
        title, // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
            enableScripts: true,
            retainContextWhenHidden: true // Keep the webview's context even when it's not visible
        }
    );

    // HTML content of the webview
    panel.webview.html = getWebviewContent(url);
}

// Modify the getWebviewContent function to use the provided URL
function getWebviewContent(url) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Web Page</title>
        </head>
        <body>
            <iframe src="${url}" width="100%" height="600"></iframe>
        </body>
        </html>
    `;
}

// Function to copy selected text to clipboard
function copySelectedText() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (selectedText) {
            vscode.env.clipboard.writeText(selectedText);
        }
    }
}