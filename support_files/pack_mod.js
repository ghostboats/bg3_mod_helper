const path = require('path');
const fs = require('fs');

const { LSLIB, getFormats, moveFileAcrossDevices, compatRootModPath } = require('./lslib_utils');
const { pak } = getFormats();

const { CREATE_LOGGER } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { getConfig } = require('./config.js');
const { rootModPath, modName, modDestPath } = getConfig();
const rootParentPath = path.dirname(rootModPath);

const temp_folder = "\\temp_folder";
const temp_path = path.normalize(rootParentPath + temp_folder);
const modTempDestPath = path.normalize(temp_path + "\\" + modName + pak);


function prepareTempDir(movedPak = false) {
    // console.log(fs.lstatSync(modTempDestPath, { throwIfNoEntry: false }).isFile()); 
    if (!(fs.existsSync(temp_path))) {
        console.log("making temp_path");
        console.log(!(fs.existsSync(temp_path)))
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


async function processPak(modPath) {
    console.log("8 %s from processPak()", modPath);

    var build = new LSLIB.PackageBuildData();
    var Packager = new LSLIB.Packager();

    try {
        await Packager.CreatePackage(modTempDestPath, modPath, build);

        moveFileAcrossDevices(modTempDestPath, modDestPath + "\\" + modName + pak);
        prepareTempDir(true);
        
    }
    catch (error) {
        console.error(error);
    }

    // bg3mh_logger.debug("%s%s exported to %s", modName, pak, modDestPath);
}


module.exports = { processPak, prepareTempDir }