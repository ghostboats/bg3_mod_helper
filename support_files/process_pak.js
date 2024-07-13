const path = require('path');
const fs = require('fs');

const { getFormats, moveFileAcrossDevices, compatRootModPath, LOAD_LSLIB } = require('./lslib_utils');
const { pak } = getFormats();

const { zipUpPak } = require('./gzip_functions');
const { xmlUpdate } = require('./xml_functions');

const { isMainThread, workerData } = require('node:worker_threads');

const { CREATE_LOGGER } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const temp_folder = path.join(path.sep, "temp_folder");

let LSLIB, 
    getConfig, 
    vscode;


async function lslib_load() {
    if (LSLIB === undefined) {
        bg3mh_logger.info("lslib not found. loading...");
        LSLIB = await LOAD_LSLIB();
    } else {
        bg3mh_logger.info("lslib is already loaded!");
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

    if (!(fs.existsSync(temp_path))) {
        console.log("making temp_path");
        fs.mkdirSync(temp_path, { recursive: true});
        return;
    }
}


// btw, sometimes this will log things before others because it's async.
async function processPak(modPath, unpackLocation = path.join(path.dirname(modPath), path.basename(modPath, pak))) {
    await lslib_load();
    var build = new LSLIB.PackageBuildData();
    var Packager = new LSLIB.Packager();

    let rootModPath, 
        modDestPath,
        zipOnPack,
        packingPriority;

    if (isMainThread) {
        vscode = require('vscode');
        getConfig = require('./config.js').getConfig();
    } else {
        getConfig = workerData.workerConfig;
    }

    rootModPath = getConfig.rootModPath;
    modDestPath = getConfig.modDestPath;
    zipOnPack = getConfig.zipOnPack;
    packingPriority = getConfig.packingPriority;
    
    build.ExcludeHidden = getConfig.excludeHidden;
    build.Priority = packingPriority;

    const lastFolderName = path.basename(rootModPath);
    const rootParentPath = path.dirname(rootModPath);
    const temp_path = path.join(rootParentPath, temp_folder);
    const modFinalDestPath = path.join(modDestPath, lastFolderName + pak);
    const modTempDestPath = path.join(temp_path, lastFolderName + pak);
    
    try {
        if (path.extname(modPath) === pak && fs.statSync(modPath).isFile()) {
            try {
                await Packager.UncompressPackage(modPath, unpackLocation);
            } catch (Error) {
                bg3mh_logger.error(Error);
            }
            bg3mh_logger.info(`Mod ${path.basename(modPath)} unpacked to ${unpackLocation}`);
            return;
        }
        
        xmlUpdate();

        await Packager.CreatePackage(modTempDestPath, modPath, build);

        bg3mh_logger.info(`${lastFolderName}${pak} packed`);
        if (isMainThread) {
            vscode.window.showInformationMessage(`${lastFolderName + pak} packed`);
        }

        zipUpPak(zipOnPack);

        moveFileAcrossDevices(modTempDestPath, modFinalDestPath);
        prepareTempDir(true);
    }
    catch (Error) {
        bg3mh_logger.error(Error);
    }
}

lslib_load();
module.exports = { 
    processPak, 
    prepareTempDir 
};