// autoCompleteProvider.js
const vscode = require('vscode');
const { commands } = require('vscode');
const autoCompleteData = require('../support_files/templates/auto_complete/auto_data');

class AutoCompleteProvider {
    provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);

        // Match pattern exactly 'data ' or 'data someWord'
        const matchKey = linePrefix.match(/data\s+(\w*)$/i);
        if (matchKey) {
            const partialWord = matchKey[1].toLowerCase();
            let suggestions = [];
            console.log(partialWord)

            // If no partial word after 'data ', show first three keys
            if (!partialWord) {
                suggestions = Object.keys(autoCompleteData).slice(0, 3).map(key => {
                    const completionItem = new vscode.CompletionItem(key, vscode.CompletionItemKind.Keyword);
                    completionItem.insertText = new vscode.SnippetString(`"${key}" "\${1}"`); // Add quotes around the key and placeholder for the value
                    return completionItem;
                });
            } else {
                // Suggest keys that start with the partial word
                suggestions = Object.keys(autoCompleteData)
                    .filter(key => key.toLowerCase().startsWith(partialWord))
                    .map(key => {
                        const completionItem = new vscode.CompletionItem(key, vscode.CompletionItemKind.Keyword);
                        completionItem.insertText = new vscode.SnippetString(`"${key}" "\${1}"`); // Add quotes around the key and placeholder for the value
                        completionItem.command = { command: 'tab', title: 'Trigger Tab Completion' };
                        return completionItem;
                    });
            }

            return suggestions;
        }

        // Match pattern for the value, including after a semicolon (e.g., 'data "SpellType" "Area;F"')
        const matchValue = linePrefix.match(/data\s+"([^"]+)"\s+"(?:[^;]*;)*(\w*)$/);
        if (matchValue) {
            const key = matchValue[1];
            const partialValueWord = matchValue[2].toLowerCase(); // Get the last word segment after the last semicolon
            let suggestions = [];

            // Provide suggestions based on the key and partial word
            if (autoCompleteData[key]) {
                autoCompleteData[key].forEach(item => {
                    if (item.toLowerCase().startsWith(partialValueWord)) {
                        const completionItem = new vscode.CompletionItem(item, vscode.CompletionItemKind.Value);
                        completionItem.insertText = `${partialValueWord.length > 0 ? item.substring(partialValueWord.length) : item}`; // Append item after semicolon
                        completionItem.command = { command: 'tab', title: 'Trigger Tab Completion' };
                        suggestions.push(completionItem);
                    }
                });
            }

            return suggestions;
        }

        return undefined;
    }
}

module.exports = AutoCompleteProvider;