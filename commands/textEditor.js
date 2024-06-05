const vscode = require('vscode');
const { marked } = require('marked');


let textEditorCommand = vscode.commands.registerCommand('bg3-mod-helper.textEditorTool', function () {
    const panel = vscode.window.createWebviewPanel(
        'textEditor',
        'Markdown and BBCode Text Editor',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'updatePreview':
                    const markdownHtml = marked(message.text);
                    const bbcodeHtml = bbcodeToHtml(markdownHtml);  // Convert BBCode in the Markdown output
                    panel.webview.postMessage({ command: 'displayPreview', htmlContent: bbcodeHtml });
                    break;
            }
        },
        undefined,
        []
    );
});

function bbcodeToHtml(text) {
    return text
        .replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>')
        .replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>')
        .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
        .replace(/\[s\](.*?)\[\/s\]/gi, '<strike>$1</strike>')
        .replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color:$1;">$2</span>')
        .replace(/\[size=(\d+)\](.*?)\[\/size\]/gi, '<span style="font-size:$1px;">$2</span>')
        .replace(/\[quote\](.*?)\[\/quote\]/gi, '<blockquote>$1</blockquote>')
        .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '<a href="$1">$2</a>')
        .replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" alt="Image"/>')
        .replace(/\[list\](.*?)\[\/list\]/gis, '<ul>$1</ul>')
        .replace(/\[\*\](.*?)(\[\*\]|<\/ul>)/gis, '<li>$1</li>')
        .replace(/\[table\](.*?)\[\/table\]/gis, '<table>$1</table>')
        .replace(/\[tr\](.*?)\[\/tr\]/gis, '<tr>$1</tr>')
        .replace(/\[th\](.*?)\[\/th\]/gis, '<th>$1</th>')
        .replace(/\[td\](.*?)\[\/td\]/gis, '<td>$1</td>')
        .replace(/\[code\](.*?)\[\/code\]/gi, '<code>$1</code>')
        .replace(/\[br\]/gi, '<br>');
}


function getWebviewContent() {
    return `
        <html>
            <head>
            <style>
                body { font-family: sans-serif; display: flex; height: 95vh; transition: background-color 0.5s, color 0.5s; }
                #editor, #preview { width: 50%; height: 100%; overflow-y: auto; padding: 10px; }
                #editor { border-right: 1px solid lightgray; }
                textarea { width: 100%; height: 100%; box-sizing: border-box; padding: 10px; border: none; outline: none; resize: none; background: inherit; color: inherit; }
                .dark-mode { background-color: #333; color: #f1f1f1; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f4f4f4; }
                blockquote { border-left: 3px solid #ccc; padding-left: 10px; margin-left: 0; }
                img { max-width: 100%; height: auto; }
            </style>
            </head>
            <body>
                <div style="position: absolute; top: 10px; right: 10px;">
                    <label><input type="checkbox" id="toggleDarkMode"> Dark Mode</label>
                </div>
                <textarea id="editor" oninput="updatePreview()"></textarea>
                <div id="preview"></div>
                <script>
                    const vscode = acquireVsCodeApi();

                    document.getElementById('toggleDarkMode').addEventListener('change', function() {
                        document.body.classList.toggle('dark-mode', this.checked);
                        document.getElementById('editor').classList.toggle('dark-mode', this.checked); // Apply dark mode to the textarea
                    });

                    function updatePreview() {
                        const text = document.getElementById('editor').value;
                        vscode.postMessage({
                            command: 'updatePreview',
                            text: text
                        });
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'displayPreview':
                                document.getElementById('preview').innerHTML = message.htmlContent;
                                break;
                        }
                    });
                </script>
            </body>
        </html>
    `;
}


module.exports = textEditorCommand;
