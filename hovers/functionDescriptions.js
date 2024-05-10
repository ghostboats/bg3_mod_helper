const vscode = require('vscode');
const functionInfo = require('../support_files/templates/functionInfo');

function setupFunctionDescriptionHoverProvider() {
    return vscode.languages.registerHoverProvider([
        { language: 'plaintext' },
        { pattern: '**/*.lsx' }
    ], {
        provideHover(document, position, token) {
            const wordRange = document.getWordRangeAtPosition(position);
            const word = document.getText(wordRange);

            if (functionInfo[word]) {
                const info = functionInfo[word];
                const contents = new vscode.MarkdownString();

                contents.appendMarkdown(`### ${word}\n\n`);
                contents.appendMarkdown(`**Description:**\n${info.description}\n\n`);
                contents.appendMarkdown(`**Parameters:**\n`);

                info.parameters.forEach(param => {
                    contents.appendMarkdown(`- \`${param}\`\n`);
                });

                contents.isTrusted = true;

                return new vscode.Hover(contents);
            }
        }
    });
}

module.exports = setupFunctionDescriptionHoverProvider;

