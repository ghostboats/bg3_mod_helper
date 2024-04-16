// createModTemplateClass.js
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function createModTemplateClass(rootModPath, modName, skeletonFiles) {
    console.log('‾‾createModTemplateClass‾‾');
    const foldersFilesToCreate = {
        classdescriptions: path.join(rootModPath,'Public',modName,'ClassDescriptions'),
        progressions: path.join(rootModPath,'Public',modName,'Progressions'),
        abilitydistributionpresets: path.join(rootModPath,'Public',modName,'CharacterCreationPresets')
    };
    
    Object.values(foldersFilesToCreate).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });

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
         switch (processedFileName) {
            case 'ClassDescriptions.lsx':
                targetPath = path.join(foldersFilesToCreate.classdescriptions, 'ClassDescriptions.lsx');
                break;
            case 'Progressions.lsx':
                targetPath = path.join(foldersFilesToCreate.progressions, 'Progressions.lsx');
                break;
            case 'AbilityDistributionPresets.lsx':
                targetPath = path.join(foldersFilesToCreate.abilitydistributionpresets, 'AbilityDistributionPresets.lsx');
                break;
            default:
                console.log(`Skipping file not meant to be created: ${processedFileName}`);
                return;
        }
        console.log(`Preparing to write file: ${targetPath}`);
    
        if (targetPath && !fs.existsSync(targetPath)) {
            fs.writeFileSync(targetPath, content);
        } else if (targetPath) {
            vscode.window.showInformationMessage(`File already exists and will not be overwritten: ${targetPath}`);
        }
    console.log("Class mod template created for:", modName);
    console.log('__createModTemplateClass__');
    });
}
module.exports = createModTemplateClass;