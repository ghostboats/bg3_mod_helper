const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../support_files/config');
const { CREATE_LOGGER } = require('../support_files/log_utils');

const { modName, rootModPath } = getConfig();
const modsDirPath = path.normalize(rootModPath + "\\Mods");
const bg3mh_logger = CREATE_LOGGER();

// Constants for DDS header parsing
const DDS_MAGIC = 0x20534444;
const DDSD_MIPMAPCOUNT = 0x20000;
const DDPF_FOURCC = 0x4;
const DDSCAPS2_CUBEMAP = 0x200;  // Definition for the cubemap flag

const headerLengthInt = 31;  // Length of the DDS header in 32-bit integers

// Offsets into the header array (in 32-bit integers)
const off_magic = 0;
const off_size = 1;
const off_flags = 2;
const off_height = 3;
const off_width = 4;
const off_mipmapCount = 7;
const off_pfFlags = 20;
const off_pfFourCC = 21;
const off_caps2 = 28;


// Additional parsing functions
function fourCCToInt32(value) {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
}

function int32ToFourCC(value) {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    );
}

function parseHeaders(arrayBuffer) {
    var header = new Int32Array(arrayBuffer, 0, headerLengthInt);

    if (header[off_magic] !== DDS_MAGIC) {
        throw new Error('Invalid magic number in DDS header');
    }

    if (!(header[off_pfFlags] & DDPF_FOURCC)) {
        throw new Error('Unsupported format, must contain a FourCC code');
    }

    var fourCC = header[off_pfFourCC];
    var format, blockBytes;
    switch (fourCC) {
        case fourCCToInt32('DXT1'):
            blockBytes = 8;
            format = 'dxt1';
            break;
        case fourCCToInt32('DXT3'):
            blockBytes = 16;
            format = 'dxt3';
            break;
        case fourCCToInt32('DXT5'):
            blockBytes = 16;
            format = 'dxt5';
            break;
        default:
            throw new Error('Unsupported FourCC code: ' + int32ToFourCC(fourCC));
    }

    var cubemap = (header[off_caps2] & DDSCAPS2_CUBEMAP) !== 0;

    return {
        format: format,
        width: header[off_width],
        height: header[off_height],
        mipMapCount: header[off_mipmapCount],
        isCubemap: cubemap
    };
}

let DDSViewerCommand = vscode.commands.registerCommand('bg3-mod-helper.DDSViewer', async function () {
    bg3mh_logger.info('‾‾DDSViewerCommand‾‾');
    const panel = vscode.window.createWebviewPanel(
        'DDSViewer',
        'DDS Viewer',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true  // Optional, based on your needs
        }
    );

    const ddsFiles = await findDDSFiles(modsDirPath);
    const ddsDetails = await Promise.all(ddsFiles.map(async file => {
        const data = await fs.promises.readFile(file);
        return {
            path: file,
            info: parseHeaders(data.buffer)
        };
    }));

    panel.webview.html = getWebviewContent(ddsDetails);

    panel.webview.onDidReceiveMessage(
        async message => {
            try {
                switch (message.command) {
                    case 'openFile':
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(message.path));
                        break;
                }
            } catch (err) {
                panel.webview.postMessage({ command: 'alert', text: 'Error' });
            }
        }
    );
    bg3mh_logger.info('__DDSViewerCommand__');
});

async function findDDSFiles(directory) {
    let files = [];
    console.log("Searching in directory: ", directory);
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        console.log(entry.isDirectory() ? "Directory: " + fullPath : "File: " + fullPath);
        if (entry.isDirectory()) {
            const subFiles = await findDDSFiles(fullPath);
            files = files.concat(subFiles);
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            console.log("File extension for " + entry.name + " is " + ext);
            if (ext === '.dds') {
                files.push(fullPath);
                console.log("DDS file found: ", fullPath);
            }
        }
    }
    if (files.length === 0) {
        console.log("No DDS files found in: ", directory);
    }
    return files;
}


function getWebviewContent(ddsDetails) {
    let content = '<h1>DDS File Viewer</h1><table border="1" style="width:100%;">';
    content += `<tr>
        <th>File Path</th>
        <th>Format</th>
        <th>Dimensions</th>
        <th>MipMaps</th>
        <th>Cubemap</th>
    </tr>`;

    if (ddsDetails.length === 0) {
        content += '<tr><td colspan="5">No DDS files found.</td></tr>';
    } else {
        ddsDetails.forEach(details => {
            content += `<tr onclick="openFile('${details.path.replace(/\\/g, '\\\\')}')" style="cursor:pointer;">
                <td>${details.path}</td>
                <td>${details.info.format}</td>
                <td>${details.info.width} x ${details.info.height}</td>
                <td>${details.info.mipMapCount}</td>
                <td>${details.info.isCubemap ? 'Yes' : 'No'}</td>
            </tr>`;
        });
    }
    content += '</table>';

    // Add script to handle file opening
    content += `
    <script>
        const vscode = acquireVsCodeApi();
        function openFile(path) {
            vscode.postMessage({
                command: 'openFile',
                path: path
            });
        }
    </script>`;

    return content;
}

module.exports = DDSViewerCommand;