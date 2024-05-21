const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { getConfig } = require('../support_files/config');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const xmlbuilder = require('xmlbuilder');
const { getModName } = require('../support_files/helper_functions.js');

async function createAtlas(iconsDir, atlasPath, texturePath, textureUUID) {
    const iconSize = 64; // Assuming all icons are 64x64
    const textureSize = 1024; // Final texture size
    let atlas = sharp({
        create: {
            width: textureSize,
            height: textureSize,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    });

    const icons = fs.readdirSync(iconsDir).filter(file => file.endsWith('.png'));
    let iconXMLNodes = [];
    let composites = [];

    for (let i = 0; i < icons.length; i++) {
        const iconPath = path.join(iconsDir, icons[i]);
        const iconName = path.parse(icons[i]).name;
        const x = (i % (textureSize / iconSize)) * iconSize;
        const y = Math.floor(i / (textureSize / iconSize)) * iconSize;

        // Prepare composite operation
        composites.push({ input: iconPath, left: x, top: y });

        // Prepare XML node for this icon
        iconXMLNodes.push({
            node: {
                '@id': 'IconUV',
                attribute: [
                    { '@id': 'MapKey', '@value': iconName, '@type': 'FixedString' },
                    { '@id': 'U1', '@value': x / textureSize, '@type': 'float' },
                    { '@id': 'V1', '@value': y / textureSize, '@type': 'float' },
                    { '@id': 'U2', '@value': (x + iconSize) / textureSize, '@type': 'float' },
                    { '@id': 'V2', '@value': (y + iconSize) / textureSize, '@type': 'float' }
                ]
            }
        });
    }

    // Apply all composites to the atlas image
    atlas = atlas.composite(composites);
    await atlas.toFile(texturePath);

    // Generate XML content
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
                        children: iconXMLNodes
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
                                        { '@id': 'Path', '@value': texturePath, '@type': 'string' },
                                        { '@id': 'UUID', '@value': textureUUID, '@type': 'FixedString' }
                                    ]
                                }
                            ]
                        }
                    }
                }
            ]
        }
    }, { encoding: 'utf-8' }).end({ pretty: true });

    // Save XML to file
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
});

module.exports = createAtlasCommand;
