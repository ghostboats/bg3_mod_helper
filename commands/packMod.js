const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { exec } = require('child_process');
const { getConfig } = require('../support_files/config');
const { modName, rootModPath,  } = getConfig();
const modsDirPath = path.join(rootModPath, 'Mods');

const { v4: uuidv4 } = require('uuid');

const { convert } = require('../support_files/conversion_junction.js');
const { getFormats } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();



const packModCommand = vscode.commands.registerCommand('bg3-mod-helper.packMod', async function () {
    const { rootModPath, modDestPath, divinePath, autoConvertLocalization, modPackTime, autoLaunchOnPack } = getConfig();

    // Check if BG3 is running
    const isRunning = await isGameRunning();

    if (isRunning) {
        vscode.window.showErrorMessage('Baldur\'s Gate 3 is currently running. Please close the game before packing the mod.');
        return; // Stop further execution
    }

    // Check if modDestPath is blank
    if (!modDestPath.includes("Larian Studios\\Baldur's Gate 3\\Mods")) {
        const useStandardPath = await vscode.window.showInformationMessage(
            'The Mods destination path does not seem to be the standard Baldur\'s Gate 3 Mods folder. Do you want to change it?',
            'Change to Standard', 'Keep Current'
        );
        if (useStandardPath === 'Change to Standard') {
            const standardPath = path.join(process.env.LOCALAPPDATA, "Larian Studios\\Baldur's Gate 3\\Mods");
            const modDestPath = standardPath
            await vscode.workspace.getConfiguration('bg3ModHelper').update('modDestPath', standardPath, vscode.ConfigurationTarget.Global);
        }
    }

    const modsDirPath = path.normalize(rootModPath + "\\Mods");
    console.log("1 " + modsDirPath);
    /*
    let modName = '';

    // Check if Mods directory exists and get the first subfolder name
    if (fs.existsSync(modsDirPath) && fs.lstatSync(modsDirPath).isDirectory()) {
        const subfolders = fs.readdirSync(modsDirPath).filter(file => {
            const filePath = path.join(modsDirPath, file);
            return fs.lstatSync(filePath).isDirectory();
        });

        if (subfolders.length > 0) {
            // Assuming we need the first subfolder. Modify as needed.
            modName = subfolders[0];
            console.log(`Mod name determined from subfolder: ${modName}`);
        } else {
            vscode.window.showErrorMessage('No subfolders found in Mods directory to get a modName variable or get correct meta location.');
            return;
        }
    } else {
        vscode.window.showErrorMessage('Mods directory not found.');
        return;
    }
    */

    const metaPath = path.normalize(modsDirPath + "\\" + modName + "\\meta.lsx");
    console.log("2 " + metaPath);

    if (!fs.lstatSync(metaPath).isFile()) {
        const shouldCreateMeta = await vscode.window.showInformationMessage('meta.lsx not found in ' + path.dirname(modsDirPath) + '. Do you want to create one?', 'Create Meta', 'Close');
        if (shouldCreateMeta === 'Create Meta') {
            // Check if the directory exists, if not, create it
            const directoryPath = path.join(rootModPath, 'Mods', modName);
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }

            const author = await vscode.window.showInputBox({ prompt: 'Enter the Author Name' });
            const description = await vscode.window.showInputBox({ prompt: 'Enter a Description for your Mod' });
            const folder = modName;
            const major = await vscode.window.showInputBox({ prompt: 'Enter the Major version number' });
            const minor = await vscode.window.showInputBox({ prompt: 'Enter the Minor version number' });
            const revision = await vscode.window.showInputBox({ prompt: 'Enter the Revision number' });
            const build = await vscode.window.showInputBox({ prompt: 'Enter the Build number' });
            const uuid = uuidv4();
            const version64 = createVersion64(major,minor,revision,build)

            const skeletonMetaPath = path.join(__dirname, '../support_files/templates/long_skeleton_files/meta.lsx');
            let fileContent = fs.readFileSync(skeletonMetaPath, 'utf8');
            let newMetaContent = createMetaContent(fileContent, author, description, folder, major, minor, revision, build, uuid, version64);

            // Write the new meta.lsx file with UTF-8 BOM
            const BOM = '\uFEFF';
            fs.writeFileSync(metaPath, BOM + newMetaContent, 'utf8');
            vscode.window.showInformationMessage('meta.lsx created successfully.');
        } else {
            return;
        }
    }

    // Add a delay before executing the packaging command
    //const packDelay = modPackTime * 1000 || 7000; // Convert seconds to milliseconds, default to 5000ms (5 seconds)
    //const delaySeconds = packDelay / 1000; // Convert milliseconds back to seconds for display
    //vscode.window.showInformationMessage(`A short ${delaySeconds} second(s) delay to allow conversion (if your merged files don't reflect in-game, try packing two times in a row and let me know).`);
    //await new Promise(resolve => setTimeout(resolve, packDelay));

    // Path to .vscode directory and settings file
    const vscodeDirPath = path.join(rootModPath, '.vscode');
    const settingsFilePath = path.join(vscodeDirPath, 'settings.json');
    let settingsContent = '';

    // Check and save settings.json if .vscode exists
    if (fs.existsSync(vscodeDirPath)) {
        if (fs.existsSync(settingsFilePath)) {
            settingsContent = fs.readFileSync(settingsFilePath, 'utf8');
        }
        // eslint threw a fit so i changed this, seems to be basically the same :catyes:
        fs.rmSync(vscodeDirPath, { recursive: true }); // Delete .vscode directory
    }
    console.log("3 %s before the convert(rootModPath, pak) in packMod.js", rootModPath)
    convert(rootModPath, pak);
});


function createMetaContent(templateContent, author, description, folder, major, minor, revision, build, uuid, version64) {
    // Replace placeholders in templateContent with actual values
    return templateContent
        .replace('{AUTHOR}', author)
        .replace('{DESCRIPTION}', description)
        .replace('{FOLDER}', folder)
        .replace('{NAME}', folder)
        .replace('{MAJOR}', major)
        .replace('{MINOR}', minor)
        .replace('{REVISION}', revision)
        .replace('{BUILD}', build)
        .replace('{UUID}', uuid)
        .replace('{VERSION64_1}', version64)
        .replace('{VERSION64_2}', version64);
}


function createVersion64(major, minor, build, revision) {
    // Convert input numbers to BigInt
    const majorBigInt = BigInt(major);
    const minorBigInt = BigInt(minor);
    const buildBigInt = BigInt(build);
    const revisionBigInt = BigInt(revision);

    // Shift bits and combine them
    const version64 = (majorBigInt << BigInt(55)) | (minorBigInt << BigInt(47)) | (revisionBigInt << BigInt(31)) | buildBigInt;

    // Return the version as a string
    return version64;
    
}

function isGameRunning() {
    return new Promise((resolve, reject) => {
        exec('tasklist', (error, stdout, stderr) => {
            if (error || stderr) {
                console.error('Error checking running processes', error || stderr);
                resolve(false); // Assuming game is not running in case of error
                return;
            }

            const isRunning = stdout.toLowerCase().includes('bg3.exe');
            resolve(isRunning);
        });
    });
}

module.exports = packModCommand;