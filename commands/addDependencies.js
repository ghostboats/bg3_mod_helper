const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const { parseStringPromise, Builder } = require('xml2js');

const { getConfig, getModName } = require('../support_files/config');

// Helper function to recursively find modsettings.lsx files
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

// Function to read XML and return an object
async function readXML(filePath) {
    const data = await fs.readFile(filePath);
    return parseStringPromise(data);
}

// Function to add dependencies to meta.lsx
async function addDependenciesToMeta(metaPath, dependencies) {
    const data = await fs.readFile(metaPath);
    const result = await parseStringPromise(data);
    if (!result.save.region[0].node[0].children[0].node) {
        result.save.region[0].node[0].children[0].node = [];
    }
    const depsNode = result.save.region[0].node[0].children[0].node;
    dependencies.forEach(dep => {
        depsNode.push({ attribute: dep });
    });
    const builder = new Builder();
    const xml = builder.buildObject(result);
    await fs.writeFile(metaPath, xml);
}

const addDependenciesCommand = vscode.commands.registerCommand('bg3-mod-helper.addDependencies', async () => {
    const modName = await getModName();
    const rootModPath = getConfig().rootModPath;
    const modsDirPath = path.join(rootModPath, "Mods");
    const metaPath = path.join(modsDirPath, modName, "meta.lsx");

    try {
        const playerProfilesPath = path.join(process.env.LOCALAPPDATA, 'Larian Studios', 'Baldur\'s Gate 3', 'PlayerProfiles');
        const modSettingsFiles = await findFiles(playerProfilesPath);
        const dependencies = [];

        for (const file of modSettingsFiles) {
            const content = await readXML(file);
            if (content && content.save && content.save.region && content.save.region[0] && 
                content.save.region[0].node && content.save.region[0].node[0] &&
                content.save.region[0].node[0].children && content.save.region[0].node[0].children[0] &&
                content.save.region[0].node[0].children[0].node) {
                const mods = content.save.region[0].node[0].children[0].node;
                mods.forEach(mod => {
                    if (mod.attribute && mod.attribute.length > 0) {
                        dependencies.push(mod.attribute[0]);
                    }
                });
            }
        }

        if (dependencies.length > 0) {
            await addDependenciesToMeta(metaPath, dependencies);
            vscode.window.showInformationMessage('Dependencies added successfully!');
        } else {
            vscode.window.showInformationMessage('No dependencies found to add.');
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage('Failed to add dependencies: ' + error.message);
    }
});

module.exports = { addDependenciesCommand };