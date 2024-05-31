const { convert } = require('../support_files/conversion_junction.js');
const vscode = require('vscode');

const { CREATE_LOGGER, raiseError } = require('../support_files/log_utils.js');
const bg3mh_logger = CREATE_LOGGER();

const { lsx, lsf, xml, loca } = require('../support_files/lslib_utils.js').getFormats();

var lsxFiles;
var lsfFiles;
var xmlFiles;
var locaFiles;


async function refreshFiles() {
    lsxFiles = await vscode.workspace.findFiles('**/*'.concat(lsx));
    // added extra files that should be shown in the lsf panel of the webview
    lsfFiles = await vscode.workspace.findFiles('**/*.{lsf,lsfx,lsc,lsj,lsbc,lsbs}');
    xmlFiles = await vscode.workspace.findFiles('**/*'.concat(xml));
    locaFiles = await vscode.workspace.findFiles('**/*'.concat(loca));
}


let openConverterCommand = vscode.commands.registerCommand('bg3-mod-helper.openConverter', async function () {
    bg3mh_logger.info('‾‾openConverterCommand‾‾');
    console.log('help');
    const panel = vscode.window.createWebviewPanel(
        'converterView',
        'Converter',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    await refreshFiles();
    console.log('files refreshed');

    panel.webview.html = getWebviewContent(lsxFiles, lsfFiles, xmlFiles, locaFiles);
    console.log('got webview content');

    panel.webview.onDidReceiveMessage(
        async message => {
            bg3mh_logger.info('Received message:', message);
            try {
                switch (message.command) {
                    case 'convertSelected':
                    case 'convertAll':
                        const pathsString = message.paths.join(", ");
                        convert(message.paths);
                        panel.webview.postMessage({ command: 'alert', text: 'Conversion successful!' });
                        await refreshFileList(panel);
                        break;
                }
            } catch (err) {
                panel.webview.postMessage({ command: 'alert', text: 'Error during conversion: ' + err.message });
                raiseError("Error during message processing: " + err, false);
            }
        }
    );
    bg3mh_logger.info('__openConverterCommand__');
});

function normalizePath(path) {
    if (path.startsWith('/')) {
        return path.slice(1);
    }
    return path;
}

async function refreshFileList(panel) {

    await refreshFiles();

    panel.webview.postMessage({
        command: 'updateFiles',
        lsxFiles: lsxFiles.map(file => file.path),
        lsfFiles: lsfFiles.map(file => file.path),
        xmlFiles: xmlFiles.map(file => file.path),
        locaFiles: locaFiles.map(file => file.path)
    });
}


function getWebviewContent(lsxFiles, lsfFiles, xmlFiles, locaFiles) {
    const makeListItems = files => files.map(file => 
        `<div class="file-item" data-path="${normalizePath(file.path)}" onclick="selectFile(this)">${file.path.split('/').pop()}</div>`
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
    .file-box { flex: 1 1 200px; border: 1px solid #333; padding: 20px; margin-bottom: 20px; background: #1e1e1e; box-shadow: 0 2px 5px rgba(0,0,0,0.3); margin: 5px; }
    .file-item { padding: 10px; margin: 8px 0; border: 1px solid #555; cursor: pointer; transition: all 0.3s ease; color: #ccc; }
    .file-item:hover, .file-item.selected { background-color: #333; border-color: #76baff; color: #fff; }
    .header { display: flex; align-items: baseline; justify-content: space-between; }
    .title { color: #bbb; cursor: pointer; }
    .title.active { color: #fff; }
    button { padding: 10px 20px; background-color: #333; border: none; color: #bbb; cursor: pointer; border-radius: 5px; transition: background 0.3s; }
    button:hover { background-color: #555; }
</style>
</head>
<body>

<div class="file-container">
    <div class="file-box" id="lsxLsfFiles">
        <div class="header">
            <span class="title active" onclick="toggleFiles('lsx', 'lsf')">Lsx Files</span> / 
            <span class="title" onclick="toggleFiles('lsf', 'lsx')">Lsf Files</span>
            <button onclick="toggleSelectAll('lsxLsfFiles')">Toggle Select All</button>
        </div>
        <div id="lsxFilesList" class="file-list">
            ${makeListItems(lsxFiles)}
        </div>
        <div id="lsfFilesList" class="file-list" style="display: none;">
            ${makeListItems(lsfFiles)}
        </div>
    </div>

    <div class="file-box" id="xmlLocaFiles">
        <div class="header">
            <span class="title active" onclick="toggleFiles('xml', 'loca')">Xml Files</span> / 
            <span class="title" onclick="toggleFiles('loca', 'xml')">Loca Files</span>
            <button onclick="toggleSelectAll('xmlLocaFiles')">Toggle Select All</button>
        </div>
        <div id="xmlFilesList" class="file-list">
            ${makeListItems(xmlFiles)}
        </div>
        <div id="locaFilesList" class="file-list" style="display: none;">
            ${makeListItems(locaFiles)}
        </div>
    </div>
</div>

<button onclick="convertSelected()">Convert Selected</button>
<button onclick="convertAll()">Convert All</button>

<script>
const vscode = acquireVsCodeApi();
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

function toggleFiles(activeType, inactiveType) {
    let activeFilesList = document.getElementById(activeType + 'FilesList');
    let inactiveFilesList = document.getElementById(inactiveType + 'FilesList');
    let activeTitle = document.querySelector('.title[onclick*="' + activeType + '"]');
    let inactiveTitle = document.querySelector('.title[onclick*="' + inactiveType + '"]');

    clearSelections(activeFilesList);
    clearSelections(inactiveFilesList);

    activeFilesList.style.display = '';
    inactiveFilesList.style.display = 'none';
    activeTitle.classList.add('active');
    inactiveTitle.classList.remove('active');
}

function clearSelections(filesList) {
    let selectedItems = filesList.getElementsByClassName('selected');
    Array.from(selectedItems).forEach(item => item.classList.remove('selected'));
}

function convertSelected() {
    let selectedFiles = Array.from(document.querySelectorAll('.file-item.selected'));
    let filePaths = selectedFiles.map(file => file.getAttribute('data-path'));
    console.log('Attempting to convert selected files with paths: %s', filePaths);
    vscode.postMessage({
        command: 'convertSelected',
        paths: filePaths
    });
}

function convertAll() {
    let allFiles = Array.from(document.querySelectorAll('.file-item'));
    let filePaths = allFiles.map(file => file.getAttribute('data-path'));
    console.log('Attempting to convert all files with paths: %s', paths);
    vscode.postMessage({
        command: 'convertAll',
        paths: filePaths
    });
}



</script>
</body>
</html>
`;
}

module.exports = openConverterCommand;


//add this in html once we figure out the syntax stuff, hopoefully it helps update the window upon conversion. Its to add listener to update webview for new files
/*
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'updateFiles':
            updateFileList('lsxFilesList', message.lsxFiles);
            updateFileList('lsfFilesList', message.lsfFiles);
            updateFileList('xmlFilesList', message.xmlFiles);
            updateFileList('locaFilesList', message.locaFiles);
            break;
    }
});

function updateFileList(elementId, files) {
    const fileList = document.getElementById(elementId);
    fileList.innerHTML = files.map(file => 
        <div class='file-item' data-path='${file}' onclick='selectFile(this)'>${file.split('/').pop()}</div>
    ).join('');
}
*/