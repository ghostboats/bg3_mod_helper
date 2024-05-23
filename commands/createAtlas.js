const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { Magick, MagickCore } = require('magickwand.js');
const xmlbuilder = require('xmlbuilder');
const { getConfig, setConfig } = require('../support_files/config');
const { getModName } = require('../support_files/helper_functions.js');
const { v4: uuidv4 } = require('uuid');

const truncate = (number, digits) => {
    const stepper = Math.pow(10.0, digits);
    return Math.round(number * stepper) / stepper;
}

async function createAtlas(iconsDir, atlasPath, texturePath, textureUUID) {
    const { rootModPath } = getConfig();
    const modName = await getModName();
    const iconSize = 64;
    const textureSize = 2048;
    const textureSizeString = `${textureSize}x${textureSize}`;

    let atlas = new Magick.Image(textureSizeString, 'rgba(0, 0, 0, 0)');

    const icons = await fs.promises.readdir(iconsDir);
    const iconXMLNodes = [];

    for (let i = 0; i < icons.length; i++) {
        const iconPath = path.join(iconsDir, icons[i]);
        const iconName = path.parse(icons[i]).name;
        const iconImage = new Magick.Image();
        await iconImage.readAsync(iconPath);

        const x = (i % (textureSize / iconSize)) * iconSize;
        const y = Math.floor(i / (textureSize / iconSize)) * iconSize;
        
        const u1 = truncate(x / textureSize, 7);
        const v1 = truncate(y / textureSize, 7);
        const u2 = truncate((x + iconSize) / textureSize, 7);
        const v2 = truncate((y + iconSize) / textureSize, 7);

        const geometry = new Magick.Geometry(iconSize, iconSize, x, y);
        await atlas.compositeAsync(iconImage, geometry, MagickCore.OverCompositeOp);

        iconXMLNodes.push({
            '@id': 'IconUV',
            attribute: [
                { '@id': 'MapKey', '@value': iconName, '@type': 'FixedString' },
                { '@id': 'U1', '@value': u1.toString(), '@type': 'float' },
                { '@id': 'V1', '@value': v1.toString(), '@type': 'float' },
                { '@id': 'U2', '@value': u2.toString(), '@type': 'float' },
                { '@id': 'V2', '@value': v2.toString(), '@type': 'float' }
            ]
        });
    }

    const ddsTexturePath = texturePath.replace('.png', '.dds');
    await atlas.writeAsync(ddsTexturePath);

    const relativeTexturePath = modName + path.sep + path.relative(path.join(rootModPath, 'Public', modName), ddsTexturePath);
    
    const xmlContent = xmlbuilder.create({
        save: {
            version: {
                '@major': '4', '@minor': '0', '@revision': '9', '@build': '322'
            },
            region: [
                {
                    '@id': 'IconUVList',
                    node: {
                        '@id': 'root',
                        children: {
                            node: iconXMLNodes
                        }
                    }
                },
                {
                    '@id': 'TextureAtlasInfo',
                    node: {
                        '@id': 'root',
                        children: {
                            node: [
                                {
                                    '@id': 'TextureAtlasIconSize',
                                    attribute: [
                                        { '@id': 'Height', '@value': iconSize, '@type': 'int32' },
                                        { '@id': 'Width', '@value': iconSize, '@type': 'int32' }
                                    ]
                                },
                                {
                                    '@id': 'TextureAtlasPath',
                                    attribute: [
                                        { '@id': 'Path', '@value': relativeTexturePath, '@type': 'string' },
                                        { '@id': 'UUID', '@value': textureUUID, '@type': 'FixedString' }
                                    ]
                                },
                                {
                                    '@id': 'TextureAtlasTextureSize',
                                    attribute: [
                                        { '@id': 'Height', '@value': textureSize, '@type': 'int32' },
                                        { '@id': 'Width', '@value': textureSize, '@type': 'int32' }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        }
    }, { encoding: 'UTF-8' }).end({ pretty: true });

    fs.writeFileSync(atlasPath, xmlContent);
}

let createAtlasCommand = vscode.commands.registerCommand('bg3-mod-helper.createAtlas', async function () {
    console.log('‾‾createAtlasCommand‾‾');
    const { rootModPath } = getConfig();
    const modName = await getModName();  // Assuming this function correctly fetches the mod's name
    const newUuid = uuidv4();

    // Directories for icons, texture, and atlas XML
    const iconsDirPath = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false });
    if (!iconsDirPath) {
        vscode.window.showErrorMessage('Icons directory not selected.');
        return;
    }

    const texturesDirPath = path.join(rootModPath, 'Public', modName, 'Assets', 'Textures', 'Icons');
    const texturePath = path.join(texturesDirPath, `Icons_${modName}.png`);
    const atlasDirPath = path.join(rootModPath, 'Public', modName, 'GUI');
    const atlasPath = path.join(atlasDirPath, `Icons_${modName}.lsx`);

    const mergedDirPath = path.join(rootModPath, 'Public', modName, 'Content', 'UI', '[PAK]_UI');
    const mergedPath = path.join(mergedDirPath, 'merged.lsx');

    // Ensure directories exist
    [texturesDirPath, atlasDirPath].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Create atlas and texture
    try {
        await createAtlas(iconsDirPath[0].fsPath, atlasPath, texturePath, newUuid);
        vscode.window.showInformationMessage('Atlas and texture created successfully.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create atlas or texture: ${error.message}`);
    }

    // Check if merged.lsx exists
    if (fs.existsSync(mergedPath)) {
        const overwrite = await vscode.window.showInformationMessage('A merged.lsx file already exists. Do you want to overwrite it?', 'Yes', 'No');
        if (overwrite === 'No') {
            return; // Stop execution if user chooses not to overwrite
        }
    }

    // Use a skeleton merged.lsx file as a template
    const skeletonMergedPath = path.join(__dirname, '../support_files/templates/long_skeleton_files/merged_atlas.lsx');
    let mergedContent = fs.readFileSync(skeletonMergedPath, 'utf8');

    // Replace placeholders in merged.lsx file
    mergedContent = mergedContent.replace(/\{uuid\}/g, newUuid);
    mergedContent = mergedContent.replace(/\{file_name\}/g, `Icons_${modName}`);
    mergedContent = mergedContent.replace(/\{file_path\}/g, `Public/${modName}/Assets/Textures/Icons/Icons_${modName}.dds`);

    // Write the modified content to the new merged.lsx file
    fs.writeFileSync(mergedPath, mergedContent, 'utf8');
    vscode.window.showInformationMessage(`merged.lsx file created/updated successfully at ${mergedDirPath}`);
});

module.exports = createAtlasCommand;
