const vscode = require('vscode');
const dotMap = require('../support_files/templates/dotFile');  // Assuming this path is correct

const debug = vscode.commands.registerCommand('bg3-mod-helper.debugCommand', function () {
    const panel = vscode.window.createWebviewPanel(
        'dotMap',
        'BG3 Map Helper',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    // Since dotMap is directly an array, we can use it directly
    panel.webview.html = getWebviewContent(dotMap);
});

function getWebviewContent(coordinates) {
    const dotsScript = coordinates.map(coordinate => `
        // Draw each dot
        ctx.beginPath();
        ctx.arc(${coordinate.x}, ${coordinate.y}, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText('${coordinate.info}', ${coordinate.x + 10}, ${coordinate.y});
    `).join('');

    return `
        <html>
            <head>
                <style>
                    canvas { width: 500px; height: 500px; }
                </style>
            </head>
            <body>
                <canvas id="mapCanvas"></canvas>
                <script>
                    const canvas = document.getElementById('mapCanvas');
                    const ctx = canvas.getContext('2d');
                    ${dotsScript}
                    // Handle canvas clicks or other interactions here
                </script>
            </body>
        </html>
    `;
}

module.exports = { debug };
