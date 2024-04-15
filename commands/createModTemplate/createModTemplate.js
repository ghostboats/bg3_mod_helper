const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getConfig } = require('../../support_files/config');
const skeletonFiles = require('../../support_files/templates/skeleton_files');
const createModTemplateClass = require('./createModTemplateClass');
const createModTemplateScriptExtender = require('./createModTemplateScriptExtender');

async function createModTemplate() {
    console.log('‾‾createModTemplate‾‾');
    const { rootModPath } = getConfig();
    if (!rootModPath || rootModPath.trim() === '') {
        vscode.window.showInformationMessage('A mod folder path needs to be supplied. Go to settings?', 'Open Settings').then(selection => {
            if (selection === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'bg3ModHelper.rootModPath');
            }
        });
        return;
    }

    const modType = await vscode.window.showQuickPick(['Generic (Coming Soon)', 'Class', 'Spell (Coming Soon)', 'Script Extender (YOU STILL NEED TO DOWNLOAD SCRIPT EXTENDER, USE THE MOD MANAGER)'], { placeHolder: 'Select the type of mod file structure you want to make.' });
    if (!modType) return; // Exit if the user didn't make a choice

    let modName;
    const modsDirPath = path.join(rootModPath, 'Mods');
    if (!fs.existsSync(modsDirPath) || !fs.lstatSync(modsDirPath).isDirectory()) {
        // Allow the user to enter a mod name
        modName = await vscode.window.showInputBox({ prompt: 'Enter the mod name' });
        if (!modName) return; // Exit if the user didn't enter a name
    } else {
        const modFolders = fs.readdirSync(modsDirPath).filter(file => fs.lstatSync(path.join(modsDirPath, file)).isDirectory());
        if (modFolders.length === 0) {
            // Allow the user to enter a mod name
            modName = await vscode.window.showInputBox({ prompt: 'Enter the mod name' });
            if (!modName) return; // Exit if the user didn't enter a name
        } else {
            modName = modFolders[0]; // Use the first directory as the mod name
        }
    }

    const foldersFilesToCreate = {
        meta: path.join(rootModPath, 'Mods', modName),
        xml: path.join(rootModPath, 'Localization', 'English')
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
            case 'meta.lsx':
                targetPath = path.join(foldersFilesToCreate.meta, 'meta.lsx');
                askMetaInfoAndUpdate(content, targetPath, modName);
                break;
            case `${modName}.xml`:
                targetPath = path.join(foldersFilesToCreate.xml, `${modName}.xml`);
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
    if (modType === 'Class') {
        // Call the function from the imported module
        createModTemplateClass(rootModPath, modName, skeletonFiles);
        return; // Exit the function after creating class mod template
    } else if (modType === 'Script Extender (YOU STILL NEED TO DOWNLOAD SCRIPT EXTENDER, USE THE MOD MANAGER)') {
        createModTemplateScriptExtender(rootModPath, modName, skeletonFiles)
    }
    vscode.window.showInformationMessage(`Folder structure generated for mod: ${modName}`);
    console.log('__createModTemplate__');
}

async function askMetaInfoAndUpdate(content, targetPath, modName) {
    console.log('‾‾askMetaInfoAndUpdate‾‾');
    const updateMeta = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Meta file contains placeholders. Do you want to update meta information?' });
    if (updateMeta === 'Yes') {
        const author = await vscode.window.showInputBox({ prompt: 'Enter the Author Name' });
        const description = await vscode.window.showInputBox({ prompt: 'Enter a Description for your Mod' });
        const major = await vscode.window.showInputBox({ prompt: 'Enter the Major version number' });
        const minor = await vscode.window.showInputBox({ prompt: 'Enter the Minor version number' });
        const revision = await vscode.window.showInputBox({ prompt: 'Enter the Revision number' });
        const build = await vscode.window.showInputBox({ prompt: 'Enter the Build number' });
        const uuid = uuidv4();
        const version64 = createVersion64(major,minor,revision,build)
        content = createMetaContent(content, author, description, modName, major, minor, revision, build, uuid, version64);
        fs.writeFileSync(targetPath, content);
    }
    console.log('__askMetaInfoAndUpdate__');
}

function createMetaContent(templateContent, author, description, modName, major, minor, revision, build, uuid, version64) {
    // Replace placeholders in templateContent with actual values
    return templateContent
        .replace('{AUTHOR}', author)
        .replace('{DESCRIPTION}', description)
        .replace('{FOLDER}', modName)
        .replace('{NAME}', modName)
        .replace('{MAJOR}', major)
        .replace('{MINOR}', minor)
        .replace('{REVISION}', revision)
        .replace('{BUILD}', build)
        .replace('{UUID}', uuid)
        .replace('{VERSION64_1}', version64)
        .replace('{VERSION64_2}', version64);
}

function createVersion64(major, minor, build, revision) {
    console.log('‾‾createVersion64‾‾');
    // Convert input numbers to BigInt
    const majorBigInt = BigInt(major);
    const minorBigInt = BigInt(minor);
    const buildBigInt = BigInt(build);
    const revisionBigInt = BigInt(revision);

    // Shift bits and combine them
    const version64 = (majorBigInt << BigInt(55)) | (minorBigInt << BigInt(47)) | (revisionBigInt << BigInt(31)) | buildBigInt;

    // Return the version as a string
    console.log('__createVersion64__');
    return version64;
}
module.exports = createModTemplate;
