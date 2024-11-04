const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const { getConfig, getModName } = require('../support_files/config');
const { rootModPath } = getConfig();

const createAssetsMetadataCommand = vscode.commands.registerCommand('bg3-mod-helper.createAssetsMetadata', async function () {
    const modName = await getModName();
    const GUIPath = path.join(rootModPath, 'Mods', modName, 'GUI');
    const assetsPath = path.join(rootModPath, 'Mods', modName, 'GUI', 'Assets');
    const metadataPath = path.join(GUIPath, 'metadata.lsx');

    // Check if the assetsPath exists
    if (!fs.existsSync(assetsPath)) {
        // Show options to create the directory or cancel
        const choice = await vscode.window.showInformationMessage(
            `The path ${assetsPath} does not exist. Do you want to create it?`,
            'Create',
            'Cancel'
        );

        if (choice === 'Create') {
            // Create the directory
            fs.mkdirSync(assetsPath, { recursive: true });
            vscode.window.showInformationMessage(`Created directory: ${assetsPath}`);
        } else {
            // User canceled the operation
            return;
        }
    }

    // Check if metadata.lsx exists
    if (fs.existsSync(metadataPath)) {
        // Show options to overwrite or cancel
        const overwrite = await vscode.window.showInformationMessage(
            `The file ${metadataPath} already exists and will be overwritten. Do you want to proceed?`,
            'Overwrite',
            'Cancel'
        );

        if (overwrite !== 'Overwrite') {
            // User chose not to overwrite the file
            return;
        }
    }

    // Proceed with creating or overwriting the metadata.lsx file

    // Get all image files
    const imageFiles = getAllDDSFiles(assetsPath, assetsPath); // baseDir is assetsPath

    const imagesData = [];

    imageFiles.forEach(({ fullPath, relativePath }) => {
        let width, height, mipMapCount;

        try {
            if (fullPath.toLowerCase().endsWith('.dds')) {
                ({ width, height, mipMapCount } = readDDSHeader(fullPath));
            } else {
                // Unsupported file type
                return;
            }

            // MapKey should be relative to 'Assets/' directory with forward slashes
            const mapKey = 'Assets/' + relativePath.replace(/\\/g, '/').replace(/\.dds$/i, '.png');

            imagesData.push({ MapKey: mapKey, width, height, mipMapCount });
        } catch (error) {
            // Handle error, e.g., log or ignore
            console.error(`Error processing file ${fullPath}: ${error.message}`);
        }
    });

    // Build the metadata.lsx content
    const metadataContent = buildMetadataLSX(imagesData);

    // Write the metadata.lsx file
    fs.writeFileSync(metadataPath, metadataContent);

    vscode.window.showInformationMessage(`metadata.lsx has been created at ${metadataPath}`);
});

module.exports = { createAssetsMetadataCommand };

// Function to recursively get all .dds image files
function getAllDDSFiles(dir, baseDir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(function(file) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllDDSFiles(filePath, baseDir, fileList);
        } else if (stat.isFile() && file.toLowerCase().endsWith('.dds')) {
            const relativePath = path.relative(baseDir, filePath);
            fileList.push({ fullPath: filePath, relativePath });
        }
    });
    return fileList;
}

// Function to read DDS header and extract width, height, and mipMapCount
function readDDSHeader(filePath) {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(128); // DDS header is 128 bytes
    fs.readSync(fd, buffer, 0, 128, 0);
    fs.closeSync(fd);

    if (buffer.toString('ascii', 0, 4) !== 'DDS ') {
        throw new Error('Not a DDS file');
    }

    const height = buffer.readUInt32LE(12);
    const width = buffer.readUInt32LE(16);
    const mipMapCount = buffer.readUInt32LE(28);

    return { width, height, mipMapCount };
}

// Function to build the metadata.lsx content
function buildMetadataLSX(imagesData) {
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<save>
    <version major="4" minor="7" revision="1" build="3" lslib_meta="v1,bswap_guids,lsf_keys_adjacency" />
    <region id="config">
        <node id="config">
            <children>
                <node id="entries">
                    <children>
`;

    imagesData.forEach(image => {
        xml += `                        <node id="Object">
                            <attribute id="MapKey" type="FixedString" value="${image.MapKey}" />
                            <children>
                                <node id="entries">
                                    <attribute id="h" type="int16" value="${image.height}" />
                                    <attribute id="mipcount" type="int8" value="${image.mipMapCount}" />
                                    <attribute id="w" type="int16" value="${image.width}" />
                                </node>
                            </children>
                        </node>
`;
    });

    xml += `                    </children>
                </node>
            </children>
        </node>
    </region>
</save>
`;

    return xml;
}
