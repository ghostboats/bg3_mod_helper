const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { exec } = require('child_process');
const { getConfig, getModName } = require('../support_files/config');

const { CREATE_LOGGER } = require('../support_files/log_utils');
const bg3mh_logger = CREATE_LOGGER();

const { v4: uuidv4 } = require('uuid');

const { convert } = require('../support_files/conversion_junction.js');
const { getFormats } = require('../support_files/lslib_utils.js');
const { pak } = getFormats();

const packModCommand = vscode.commands.registerCommand('bg3-mod-helper.packMod', async function (action) {
    bg3mh_logger.info("pack button clicked", false);
    const { rootModPath, modDestPath, lslibPath } = getConfig();
    const modName = await getModName();

    const modsDirPath = path.join(rootModPath, "Mods");
    const metaPath = path.join(modsDirPath, modName, "meta.lsx");

    // Check if BG3 is running might not need anymore i cant rememebr
    const gameRunning = await handleGameRunning();

    if (gameRunning) {
        vscode.window.showErrorMessage('Baldur\'s Gate 3 is currently running. Please close the game before packing the mod or enable autoclose in settings.');
        return; // Stop further execution
    }

    const workspaceState = vscode.workspace.getConfiguration('bg3ModHelper');
    const promptedForModDestPath = workspaceState.get('promptedForModDestPath', false);

    if (!promptedForModDestPath) {
        if (!modDestPath.includes(path.join("Larian Studios", "Baldur's Gate 3", "Mods"))) {
            const useStandardPath = await vscode.window.showInformationMessage(
                'The Mods destination path does not seem to be the standard Baldur\'s Gate 3 Mods folder. Do you want to change it?',
                'Change to Standard', 'Keep Current'
            );
            if (useStandardPath === 'Change to Standard') {
                const standardPath = path.join(process.env.LOCALAPPDATA, "Larian Studios", "Baldur's Gate 3", "Mods");
                await vscode.workspace.getConfiguration('bg3ModHelper').update('modDestPath', standardPath, vscode.ConfigurationTarget.Global);
            } else {
                await workspaceState.update('promptedForModDestPath', true);
            }
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

    // send the directory to the convert() function, and let it know it's a pak
    await convert(rootModPath, pak, action);

    console.log(action)
    if (action === 'packAndPlay') {
        console.log('rrr')
        vscode.commands.executeCommand('bg3-mod-helper.launchGame');
    }
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

function handleGameRunning() {
    return new Promise((resolve, reject) => {
        exec('tasklist', async (error, stdout, stderr) => {
            if (error || stderr) {
                bg3mh_logger.error("Error checking running processes: " + (error || stderr));
                resolve(false); // Assuming game is not running in case of error
                return;
            }

            // Check if BG3 is running (add Linux check if necessary)
            const isRunning = stdout.toLowerCase().includes('bg3.exe');
            
            if (isRunning) {
                const { autoCloseBG3 } = getConfig();
                if (autoCloseBG3) {
                    exec('taskkill /F /IM bg3.exe', (killError, killStdout, killStderr) => {
                        if (killError || killStderr) {
                            bg3mh_logger.error("Error closing Baldur's Gate 3: " + (killError || killStderr));
                            resolve(false); // Return false if there was an error closing the game
                            return;
                        }

                        vscode.window.showInformationMessage('Baldur\'s Gate 3 was closed to pack the mod.');
                        bg3mh_logger.info("Baldur's Gate 3 was successfully closed.");
                        resolve(false);
                    });
                } else {
                    resolve(true); // Game is running, but user opted not to auto-close
                }
            } else {
                resolve(false); // Game is not running
            }
        });
    });
}

module.exports = { packModCommand };
