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

async function extractDependencies(filePath, dependencyMap) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const profileName = path.basename(path.dirname(filePath));
    const dependencies = [];
    const regex = /<node id="ModuleShortDesc">([\s\S]*?)<\/node>/g;
    let match;

    while ((match = regex.exec(fileContent))) {
        console.log('Match found:', match[1]);
        const attributes = {};
        const attributeMatch = /<attribute id="([^"]+)" type="([^"]+)" value="([^"]*)" \/>/g;
        let attr;

        while ((attr = attributeMatch.exec(match[1]))) {
            attributes[attr[1]] = {
                '@id': attr[1],
                '@type': attr[2],
                '@value': attr[3]
            };
        }

        console.log('Attributes:', attributes);

        if (Object.keys(attributes).length > 0) {
            const depItem = {
                label: attributes['Name'] ? attributes['Name']['@value'] : 'No Name',
                description: attributes['UUID'] ? attributes['UUID']['@value'] : '',
                detail: `Profile Name: ${profileName}`
                // Do not include 'attributes' here
            };
            dependencies.push(depItem);
            const key = depItem.label + '|' + depItem.description;
            dependencyMap.set(key, {
                attributes: Object.values(attributes)
            });
        }
    }

    return dependencies;
}

async function addDependenciesToMeta(metaPath, selectedDependencies) {
    let data = await fs.readFile(metaPath, 'utf8');

    // Indentation levels
    const indentLevel = '\t'; // One tab
    const baseIndent = indentLevel.repeat(4); // Level 4
    const nodeIndent = baseIndent; // Level 4
    const childIndent = nodeIndent + indentLevel; // Level 5
    const moduleShortDescIndent = childIndent + indentLevel; // Level 6
    const attrIndent = moduleShortDescIndent + indentLevel; // Level 7

    // Prepare the dependencies node string with current indentation
    let depString = selectedDependencies.map(dep => {
        let attrString = dep.attributes.map(attr => `${attrIndent}<attribute id="${attr['@id']}" type="${attr['@type']}" value="${attr['@value']}" />`).join('\n');
        return `${moduleShortDescIndent}<node id="ModuleShortDesc">\n${attrString}\n${moduleShortDescIndent}</node>`;
    }).join('\n');

    // Full Dependencies node with current indentation
    let dependenciesNode = `${nodeIndent}<node id="Dependencies">\n${childIndent}<children>\n${depString}\n${childIndent}</children>\n${nodeIndent}</node>`;

    // Manually adjust the indentation of the opening <node id="Dependencies"> tag
    dependenciesNode = dependenciesNode.split('\n').map((line, index) => {
        if (index === 0) {
            // Remove 4 tabs from the opening tag's indentation
            return line.replace(/^\t{4}/, '');
        }
        return line;
    }).join('\n');

    // Attempt to find and replace self-closing Dependencies node
    let selfClosingRegex = /<node id="Dependencies"\s*\/>/g;
    if (selfClosingRegex.test(data)) {
        // Replace self-closing tag with full dependencies node
        data = data.replace(selfClosingRegex, dependenciesNode);
    } else {
        // Attempt to find full Dependencies node
        let dependenciesRegex = /<node id="Dependencies">[\s\S]*?<\/node>/;
        let dependenciesNodeMatch = dependenciesRegex.exec(data);
        if (dependenciesNodeMatch) {
            // Dependencies node exists, update it
            let existingDependencies = dependenciesNodeMatch[0];
            let existingChildrenMatch = /<children>([\s\S]*?)<\/children>/m.exec(existingDependencies);
            let existingChildren = existingChildrenMatch ? existingChildrenMatch[1] : '';

            // Prepare new dependencies to add
            let newDeps = [];
            selectedDependencies.forEach(dep => {
                const uuid = dep.attributes.find(attr => attr['@id'] === 'UUID')?.['@value'];
                if (!existingDependencies.includes(`value="${uuid}"`)) {
                    let attrString = dep.attributes.map(attr => `${attrIndent}<attribute id="${attr['@id']}" type="${attr['@type']}" value="${attr['@value']}" />`).join('\n');
                    let newNode = `${moduleShortDescIndent}<node id="ModuleShortDesc">\n${attrString}\n${moduleShortDescIndent}</node>`;
                    newDeps.push(newNode); // Append only if UUID not present
                }
            });

            if (newDeps.length > 0) {
                // Append new dependencies to existing children
                existingChildren = existingChildren.trim() + '\n' + newDeps.join('\n');
                // Reconstruct the Dependencies node with updated children
                let updatedDependenciesNode = existingDependencies.replace(/<children>[\s\S]*?<\/children>/, `<children>\n${existingChildren}\n${childIndent}</children>`);
                data = data.replace(dependenciesRegex, updatedDependenciesNode);
            }
        } else {
            // No Dependencies node at all, insert before <node id="ModuleInfo">
            let moduleInfoRegex = /(\s*)(<node id="ModuleInfo">)/;
            let moduleInfoMatch = moduleInfoRegex.exec(data);
            if (moduleInfoMatch) {
                let insertIndex = moduleInfoMatch.index;
                let before = data.slice(0, insertIndex).trimEnd();
                let after = data.slice(insertIndex).trimStart();
                data = before + '\n' + dependenciesNode + '\n' + after;
            } else {
                vscode.window.showErrorMessage('Failed to find ModuleInfo node in meta.lsx.');
                return;
            }
        }
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
        console.log('Player Profiles Path:', playerProfilesPath);
        let allDependencies = [];
        const dependencyMap = new Map();
        const modSettingsFiles = await findFiles(playerProfilesPath);

        for (const filePath of modSettingsFiles) {
            const dependencies = await extractDependencies(filePath, dependencyMap);
            allDependencies.push(...dependencies);
        }

        console.log('All Dependencies:', allDependencies);

        const selected = await vscode.window.showQuickPick(allDependencies, {
            canPickMany: true,
            placeHolder: 'Select dependencies to add to the meta.lsx'
        });

        if (selected && selected.length > 0) {
            const selectedDependencies = selected.map(item => {
                const key = item.label + '|' + item.description;
                return dependencyMap.get(key);
            });
            await addDependenciesToMeta(metaPath, selectedDependencies);
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
