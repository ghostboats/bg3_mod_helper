const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const { CREATE_LOGGER } = require('../support_files/log_utils.js');

const bg3mh_logger = CREATE_LOGGER();

let rotationToolCommand = vscode.commands.registerCommand('bg3-mod-helper.rotationTool', function () {
    bg3mh_logger.info('‾‾rotationToolCommand‾‾');
    const panel = vscode.window.createWebviewPanel(
        'rotationTool',
        'Rotation Tool',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    bg3mh_logger.info('__rotationToolCommand__');
});


function getWebviewContent() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rotation Tool</title>
    <style>
        body { padding: 10px; }
        label { margin-right: 8px; display: block; margin-top: 10px; }
        input[type="text"] { margin: 5px; }
    </style>
</head>
<body>
    <h1>Rotation Tool</h1>
    <div>
        <label><input type="radio" name="angleFormat" value="degrees" checked> Degrees</label>
        <label><input type="radio" name="angleFormat" value="radians"> Radians</label>
    </div>
    <hr>
    <h2>Input Vector (Y treated as angle in degrees)</h2>
    <div>
        <label>X:
            <input type="text" id="x" value="0" oninput="updateQuaternion()" readonly>
        </label>
        <label>Y:
            <input type="text" id="y" value="0" oninput="updateQuaternion()">
        </label>
        <label>Z:
            <input type="text" id="z" value="0" oninput="updateQuaternion()" readonly>
        </label>
    </div>
    <hr>
    <h2>Output (Quaternion)</h2>
    <div>
        <label>X:
            <input type="text" id="outQx" readonly>
        </label>
        <label>Y:
            <input type="text" id="outQy" readonly>
        </label>
        <label>Z:
            <input type="text" id="outQz" readonly>
        </label>
        <label>W (real part):
            <input type="text" id="outQw" readonly>
        </label>
    </div>
    <script>
        function updateQuaternion() {
            const angleDeg = parseFloat(document.getElementById('y').value) || 0;
            const angleRad = angleDeg * Math.PI / 180;
            const sinHalfAngle = Math.sin(angleRad / 2);
            const cosHalfAngle = Math.cos(angleRad / 2);

            // Since rotation is only around the Y-axis
            const qx = 0;
            const qy = sinHalfAngle;
            const qz = 0;
            const qw = cosHalfAngle;

            document.getElementById('outQx').value = qx.toFixed(4);
            document.getElementById('outQy').value = qy.toFixed(4);
            document.getElementById('outQz').value = qz.toFixed(4);
            document.getElementById('outQw').value = qw.toFixed(4);
        }
        // Initialize quaternion outputs with defaults
        updateQuaternion();
    </script>
</body>
</html>
    `;
}



module.exports = rotationToolCommand;
