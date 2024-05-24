const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;

const { getConfig, getModName } = require('../support_files/config');

async function findFiles(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const res = path.resolve(dir, file.name);
        if (file.isDirectory()) {
            fileList = await findFiles(res, fileList);
        } else if (file.name.toLowerCase() === 'modsettings.lsx') {
            fileList.push(res);
        }
    }
    return fileList;
}

async function extractDependencies(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const profileName = path.basename(path.dirname(filePath));
    const dependencies = [];
    const regex = /<node id="ModuleShortDesc">([\s\S]*?)<\/node>/g;
    let match;

    while ((match = regex.exec(fileContent))) {
        const attributes = {};
        const attributeMatch = /<attribute id="([^"]+)" value="([^"]+)" type="([^"]+)" \/>/g;
        let attr;

        while ((attr = attributeMatch.exec(match[1]))) {
            attributes[attr[1]] = {
                '@id': attr[1],
                '@value': attr[2],
                '@type': attr[3]
            };
        }

        if (Object.keys(attributes).length > 0) {
            dependencies.push({
                label: attributes['Name'] ? attributes['Name']['@value'] : 'No Name',
                description: filePath,
                detail: `Profile Name: ${profileName}`,
                attributes: Object.values(attributes)
            });
        }
    }

    return dependencies;
}

async function addDependenciesToMeta(metaPath, selectedDependencies) {
    let data = await fs.readFile(metaPath, 'utf8');
    let depString = selectedDependencies.map(dep => {
        let attrString = dep.attributes.map(attr => `\n\t\t\t\t\t<attribute id="${attr['@id']}" value="${attr['@value']}" type="${attr['@type']}" />`).join('');
        return `\n\t\t\t\t<node id="ModuleShortDesc">${attrString}\n\t\t\t\t</node>`;
    }).join('');

    if (data.includes('<node id="Dependencies"><children>')) {
        data = data.replace(/(<node id="Dependencies"><children>)([\s\S]*?)(<\/children><\/node>)/, `$1$2${depString}\n\t\t\t$3`);
    } else if (data.includes('<node id="Dependencies" />')) {
        data = data.replace('<node id="Dependencies" />', `<node id="Dependencies">\n\t\t<children>${depString}\n\t\t</children>\n\t</node>`);
    } else {
        data = data.replace('</children>', `\n\t<node id="Dependencies">\n\t\t<children>${depString}\n\t\t</children>\n\t</node>\n</children>`);
    }

    await fs.writeFile(metaPath, data, 'utf8');
}

const addDependenciesCommand = vscode.commands.registerCommand('bg3-mod-helper.addDependencies', async () => {
    const modName = await getModName();
    const rootModPath = getConfig().rootModPath;
    const modsDirPath = path.join(rootModPath, "Mods");
    const metaPath = path.join(modsDirPath, modName, "meta.lsx");

    try {
        const playerProfilesPath = path.join(process.env.LOCALAPPDATA, 'Larian Studios', 'Baldur\'s Gate 3', 'PlayerProfiles');
        let allDependencies = [];
        const modSettingsFiles = await findFiles(playerProfilesPath);

        for (const filePath of modSettingsFiles) {
            const dependencies = await extractDependencies(filePath);
            allDependencies.push(...dependencies);
        }

        const selected = await vscode.window.showQuickPick(allDependencies, {
            canPickMany: true,
            placeHolder: 'Select dependencies to add to the meta.lsx'
        });

        if (selected && selected.length > 0) {
            await addDependenciesToMeta(metaPath, selected);
            vscode.window.showInformationMessage('Dependencies added successfully!');
        } else {
            vscode.window.showInformationMessage('No dependencies selected.');
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage('Failed to add dependencies: ' + error.message);
    }
});

module.exports = { addDependenciesCommand };
