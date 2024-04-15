// createModTemplateScriptExtender.js
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function createModTemplateScriptExtender(rootModPath, modName, skeletonFiles) {
    console.log('‾‾createModTemplateScriptExtender‾‾');
    const foldersFilesToCreate = {
        lua: path.join(rootModPath, 'Mods', modName, 'ScriptExtender', 'Lua'),
        config: path.join(rootModPath, 'Mods', modName, 'ScriptExtender')
    };

    // Create directories if they don't exist
    Object.values(foldersFilesToCreate).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });

    // Copy template files to the appropriate locations
    Object.entries(skeletonFiles).forEach(([fileName, content]) => {
        let processedFileName = fileName.replace('{mod_name}', modName);
        processedFileName = fileName.replace('RENAME_ME.loca', modName);
        let targetPath;
        if (typeof content === 'string' && content.startsWith('../')) {
            // Adjust the path as necessary
            let filePath = path.join(__dirname, '../', content);
            if (fs.existsSync(filePath)) {
                content = fs.readFileSync(filePath, 'utf-8');
            } else {
                console.error(`File not found: ${filePath}`);
                return;
            }
        }
    
         // Determine the target path based on the file name
         switch (processedFileName) {
            case 'BootstrapServer.lua':
                targetPath = path.join(foldersFilesToCreate.lua, 'BootstrapServer.lua');
                break;
            case 'Config.json':
                targetPath = path.join(foldersFilesToCreate.config, 'Config.json');
                break;
            default:
                console.log(`Skipping file not meant to be created: ${processedFileName}`);
                return; // Skip files not intended to be created
        }

        console.log(`Preparing to write file: ${targetPath}`);
    
        if (targetPath && !fs.existsSync(targetPath)) {
            fs.writeFileSync(targetPath, content);
        } else if (targetPath) {
            vscode.window.showInformationMessage(`File already exists and will not be overwritten: ${targetPath}`);
        }
    });
    console.log("Script Extender mod template created for:", modName);
    console.log('__createModTemplateScriptExtender__');
}
module.exports = createModTemplateScriptExtender;