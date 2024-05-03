const { convert } = require('../support_files/conversion_junction.js');
const vscode = require('vscode');

let openConverterCommand = vscode.commands.registerCommand('bg3-mod-helper.openConverter', async function () {
    console.log('‾‾openConverterCommand‾‾');
    const panel = vscode.window.createWebviewPanel(
        'converterView',
        'Converter',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const lsxFiles = await vscode.workspace.findFiles('**/*.lsx');
    const lsfFiles = await vscode.workspace.findFiles('**/*.lsf');
    const xmlFiles = await vscode.workspace.findFiles('**/*.xml');
    const locaFiles = await vscode.workspace.findFiles('**/*.loca');

    panel.webview.html = getWebviewContent(lsxFiles, lsfFiles, xmlFiles, locaFiles);
    console.log('__openConverterCommand__');
});

function getWebviewContent(lsxFiles, lsfFiles, xmlFiles, locaFiles) {
    const makeListItems = files => files.map(file => 
        `<div class='file-item' data-path='${file.path}' onclick='selectFile(this)'>${file.path.split('/').pop()}</div>`
    ).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>File Manager</title>
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #121212; color: #ccc; }
    .file-container { display: flex; flex-wrap: wrap; justify-content: space-around; }
    .file-box { flex: 1 1 200px; /* Sets a minimum width of 200px and allows boxes to grow */ border: 1px solid #333; padding: 20px; margin-bottom: 20px; background: #1e1e1e; box-shadow: 0 2px 5px rgba(0,0,0,0.3); margin: 5px; }
    .file-item { padding: 10px; margin: 8px 0; border: 1px solid #555; cursor: pointer; transition: all 0.3s ease; color: #ccc; }
    .file-item:hover, .file-item.selected { background-color: #333; border-color: #76baff; color: #fff; }
    .header { display: flex; align-items: baseline; }
    h3 { color: #ddd; margin-right: 10px; flex-grow: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    button { padding: 10px 20px; background-color: #333; border: none; color: #bbb; cursor: pointer; border-radius: 5px; transition: background 0.3s; }
    button:hover { background-color: #555; }
</style>
</head>
<body>

<div class="file-container">
    <div class="file-box" id="lsxFiles">
        <div class="header">
            <h3>Lsx Files</h3>
            <button onclick="toggleSelectAll('lsxFiles')">Toggle Select All</button>
        </div>
        <div id="lsxFilesList">${makeListItems(lsxFiles)}</div>
    </div>

    <div class="file-box" id="lsfFiles">
        <div class="header">
            <h3>Lsf Files</h3>
            <button onclick="toggleSelectAll('lsfFiles')">Toggle Select All</button>
        </div>
        <div id="lsfFilesList">${makeListItems(lsfFiles)}</div>
    </div>

    <div class="file-box" id="xmlFiles">
        <div class="header">
            <h3>Xml Files</h3>
            <button onclick="toggleSelectAll('xmlFiles')">Toggle Select All</button>
        </div>
        <div id="xmlFilesList">${makeListItems(xmlFiles)}</div>
    </div>

    <div class="file-box" id="locaFiles">
        <div class="header">
            <h3>Loca Files</h3>
            <button onclick="toggleSelectAll('locaFiles')">Toggle Select All</button>
        </div>
        <div id="locaFilesList">${makeListItems(locaFiles)}</div>
    </div>
</div>

<button onclick="convertSelected()">Convert Selected</button>
<button onclick="convertAll()">Convert All</button>

<script>
function selectFile(element) {
    element.classList.toggle('selected');
}

function toggleSelectAll(boxId) {
    let box = document.getElementById(boxId);
    let files = box.getElementsByClassName('file-item');
    let allSelected = Array.from(files).every(file => file.classList.contains('selected'));
    for (let file of files) {
        if (allSelected) file.classList.remove('selected');
        else file.classList.add('selected');
    }
}

function convertSelected() {
    let selectedFiles = Array.from(document.querySelectorAll('.file-item.selected'));
    let filePaths = selectedFiles.map(file => file.getAttribute('data-path'));
    convert(filePaths).then(result => {
        alert('Conversion successful!');
    }).catch(err => {
        alert('Error during conversion: ' + err.message);
    });
}

function convertAll() {
    let allFiles = Array.from(document.querySelectorAll('.file-item'));
    let filePaths = allFiles.map(file => file.getAttribute('data-path'));
    convert(filePaths).then(result => {
        alert('Conversion successful!');
    }).catch(err => {
        alert('Error during conversion: ' + err.message);
    });
}
</script>
</body>
</html>
`;
}

module.exports = openConverterCommand;
