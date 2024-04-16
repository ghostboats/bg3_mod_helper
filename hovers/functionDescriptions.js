const vscode = require('vscode');
const functionInfo = require('../support_files/templates/functionInfo'); // Assume this contains your function descriptions and parameters

function setupFunctionDescriptionHoverProvider() {
    return vscode.languages.registerHoverProvider([
        { language: 'plaintext' }, // For .txt files
        { pattern: '**/*.lsx' }    // For .lsx files using a filename pattern
    ], {
        provideHover(document, position, token) {
            const wordRange = document.getWordRangeAtPosition(position);
            const word = document.getText(wordRange);

            // Check if the word is a function name
            if (functionInfo[word]) {
                const info = functionInfo[word];
                const contents = new vscode.MarkdownString();

                // Styling the hover content
                contents.appendMarkdown(`### ${word}\n\n`); // Function name in bold
                contents.appendMarkdown(`**Description:**\n${info.description}\n\n`); // Description in bold
                contents.appendMarkdown(`**Parameters:**\n`);

                // Styling each parameter
                info.parameters.forEach(param => {
                    contents.appendMarkdown(`- \`${param}\`\n`); // Parameter in code style
                });

                // Ensures that the Markdown content is rendered correctly
                contents.isTrusted = true;

                return new vscode.Hover(contents);
            }
        }
    });
}

module.exports = setupFunctionDescriptionHoverProvider;

