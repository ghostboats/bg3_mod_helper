const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { exec } = require('child_process');
const { getConfig, getModName } = require('../support_files/config');
const { rootModPath } = getConfig();

const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils');
const bg3mh_logger = CREATE_LOGGER();

const vscodeDirPath = path.join(rootModPath, '.vscode');

const { v4: uuidv4 } = require('uuid');

const { convert } = require('../support_files/conversion_junction.js');
const { getFormats } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();


// i think we should separate out the functions here if possible- maybe put some of them in helper_functions?
const packModCommand = vscode.commands.registerCommand('bg3-mod-helper.packMod', async function () {
    raiseInfo("pack button clicked", false);
    const { rootModPath, modDestPath, lslibPath, autoLaunchOnPack } = getConfig();
    const modName = getModName();

    const modsDirPath = path.normalize(rootModPath + "\\Mods");
    const metaPath = path.normalize(modsDirPath + "\\" + modName + "\\meta.lsx");

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

    bg3mh_logger.info("Grabbed mod name %s from %s.", modName, rootModPath);

    if (!fs.existsSync(metaPath)) {
        const shouldCreateMeta = await vscode.window.showInformationMessage('meta.lsx not found in ' + metaPath + '. Do you want to create one?', 'Create Meta', 'Close');
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
        } 
        else {
            bg3mh_logger.info(metaPath);
            
            return;
        }
    }

    // changed existsSync() to statSync().isFile(), since existsSync() is being deprecated. this section can be shortened with the saveConfigFile and loadConfigFile functions in helper_functions.js
    // Path to .vscode directory and settings file
    const vscodeDirPath = path.join(rootModPath, '.vscode');
    const settingsFilePath = path.join(vscodeDirPath, 'settings.json');
    let settingsContent = '';

    // Check and save settings.json if .vscode exists
    if (fs.statSync(vscodeDirPath).isFile()) {
        if (fs.statSync(settingsFilePath).isFile()) {
            settingsContent = fs.readFileSync(settingsFilePath, 'utf8');
        }
        // console.log('test1')
        fs.rmSync(vscodeDirPath, { recursive: true }); // Delete .vscode directory
        // console.log('test2')
    }
    // send the directory to the convert() function, and let it know it's a pak
    await convert(rootModPath, pak, modName);

    if (settingsContent) {
        // console.log('test3')
        if (!fs.statSync(vscodeDirPath).isFile()) {
            fs.mkdirSync(vscodeDirPath, { recursive: true });
            // console.log('test4')
        }
        fs.writeFileSync(settingsFilePath, settingsContent, 'utf8');
        // console.log('test5')
    }
    if (autoLaunchOnPack) {
        vscode.commands.executeCommand('bg3-mod-helper.launchGame');
    }
    // console.log('test6')
});


function createMetaContent(templateContent, author, description, folder, major, minor, revision, build, uuid, version64) {
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
    const majorBigInt = BigInt(major);
    const minorBigInt = BigInt(minor);
    const buildBigInt = BigInt(build);
    const revisionBigInt = BigInt(revision);

    const version64 = (majorBigInt << BigInt(55)) | (minorBigInt << BigInt(47)) | (revisionBigInt << BigInt(31)) | buildBigInt;

    return version64;
    
}

function isGameRunning() {
    return new Promise((resolve, reject) => {
        exec('tasklist', (error, stdout, stderr) => {
            if (error || stderr) {
                raiseError("Error checking running processes" + error || stderr);
                resolve(false); // Assuming game is not running in case of error
                return;
            }

            const isRunning = stdout.toLowerCase().includes('bg3.exe');
            resolve(isRunning);
        });
    });
}

module.exports = packModCommand;