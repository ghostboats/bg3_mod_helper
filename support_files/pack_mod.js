const path = require('path');
const fs = require('fs');

const { LSLIB, getFormats, moveFileAcrossDevices } = require('./lslib_utils');
const { pak } = getFormats();

const { CREATE_LOGGER } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { getConfig } = require('./config.js');
const { rootModPath, modName, modDestPath } = getConfig();
const rootParentPath = path.dirname(rootModPath);

const temp_folder = "\\temp_folder";
const temp_path = path.normalize(rootParentPath + temp_folder);
const modTempDestPath = path.normalize(temp_path + "\\" + modName + pak);


function prepareTempDir() {
    try {
        if (!fs.existsSync(temp_path)) {
            fs.mkdirSync(temp_path, { recursive: true});
        }
        else {
            if (fs.existsSync(modTempDestPath)) {
                fs.unlinkSync(modTempDestPath);
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}


async function processPak(modPath) {
    var build = new LSLIB.PackageBuildData();
    var Packager = new LSLIB.Packager();

    try {
        await Packager.CreatePackage(modTempDestPath, modPath, build);

        moveFileAcrossDevices(modTempDestPath, modDestPath);
        prepareTempDir();
        
    }
    catch (error) {
        console.error(error);
    }

    bg3mh_logger.debug("%s%s exported to %s", modName, pak, modDestPath);
}


module.exports = { processPak, prepareTempDir }