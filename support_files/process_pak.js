const path = require('path');
const fs = require('fs');

const { getFormats, moveFileAcrossDevices, compatRootModPath, LOAD_LSLIB } = require('./lslib_utils');
const { pak } = getFormats();

const { isMainThread, workerData } = require('node:worker_threads');

const { CREATE_LOGGER, raiseError, raiseInfo } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const temp_folder = "\\temp_folder";
// const temp_path = path.join(rootParentPath, temp_folder);
var LSLIB, getConfig, vscode;

async function lslib_load() {
    if (LSLIB === undefined) {
        console.log("lslib not found. loading...");
        LSLIB = await LOAD_LSLIB();
        // console.log(typeof(LSLIB))
    } else {
        console.log("lslib is already loaded!");
    }
}


// this function is getting redone for next release
function prepareTempDir(movedPak = false) {
    let rootModPath;
    if (isMainThread) {
        getConfig = require('./config.js').getConfig();
        rootModPath = getConfig.rootModPath;
    } else {
        getConfig = workerData.workerConfig;
        rootModPath = getConfig.rootModPath;
    }
    
    const rootParentPath = path.dirname(rootModPath);

    const temp_path = path.join(rootParentPath, temp_folder);
    // console.log('test11')
    if (!(fs.existsSync(temp_path))) {
        console.log("making temp_path");
        fs.mkdirSync(temp_path, { recursive: true});
        return;
    }
    // this is being finicky :starege:
    /*
    else if (movedPak) {
        console.log("deleting temp_path %s", modTempDestPath);
        console.log(fs.existsSync(modTempDestPath))
        fs.unlinkSync(modTempDestPath);
        fs.rmSync(temp_path, { recursive: true, force: true });
  
        return;
    }
    */
}


// btw, sometimes this will log things before others because it's async.
async function processPak(modPath, modName, unpackLocation = path.join(path.dirname(modPath), path.basename(modPath, pak))) {
    await lslib_load();
    var build = new LSLIB.PackageBuildData();
    var Packager = new LSLIB.Packager();

    let rootModPath, modDestPath;

    if (isMainThread) {
        vscode = require('vscode');
        getConfig = require('./config.js').getConfig();

    } else {
        getConfig = workerData.workerConfig;
    }

    rootModPath = getConfig.rootModPath;
    modDestPath = getConfig.modDestPath;

    console.log(rootModPath);
    console.log(modDestPath);

    const lastFolderName = path.basename(rootModPath);
    const rootParentPath = path.dirname(rootModPath);
    const temp_path = path.join(rootParentPath, temp_folder);
    const modFinalDestPath = path.join(modDestPath, lastFolderName + pak);
    const modTempDestPath = path.join(temp_path, lastFolderName + pak);
    const metaPath = path.join(rootModPath, 'Mods', modName, 'meta.lsx');
    

    try {
        if (path.extname(modPath) === pak && fs.statSync(modPath).isFile()) {
            try {
                console.log(unpackLocation);
                await Packager.UncompressPackage(modPath, unpackLocation);
            }
            catch (Error) {
                raiseError(Error);
            }
            raiseInfo(`Mod ${path.basename(modPath)} unpacked to ${unpackLocation}`)
            return;
        }
        // i'd like to refactor xml code into its own file for next release

        // Read the XML content
        let xmlContent = fs.readFileSync(metaPath, 'utf8');

        // Modify the Name attribute in the XML
        xmlContent = xmlContent.replace(/(<attribute id="Name" type="FixedString" value=")(.*?)("\/>)/, `$1${lastFolderName}$3`);

        // Write the updated XML back to the file
        fs.writeFileSync(metaPath, xmlContent, 'utf8');
        bg3mh_logger.info('meta.lsx updated successfully.');

        await Packager.CreatePackage(modTempDestPath, modPath, build, true);

        raiseInfo(lastFolderName + pak + " packed", false);
        if (isMainThread) {
            vscode.window.showInformationMessage(`${lastFolderName + pak} packed`);
        }

        // move files to chosen path and [in progress] clean up the empty directory
        moveFileAcrossDevices(modTempDestPath, modFinalDestPath);
        prepareTempDir(true);
    }
    catch (Error) {
        raiseError(Error);
    }
}

lslib_load();
module.exports = { processPak, prepareTempDir };