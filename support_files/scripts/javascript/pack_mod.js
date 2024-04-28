const path = require('path');
const fs = require('fs');

const { LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { pak } = getFormats();
const { logPath } = require('./log_utils');

const { getConfig } = require('../../config.js');
const { rootModPath, modName } = getConfig();
const rootParentPath = path.dirname(rootModPath);

const temp_folder = "\\temp_folder";
const temp_path = path.normalize(rootParentPath + temp_folder);
const modDestPath = path.normalize(temp_path + "\\" + modName + pak);

const log4js = require('log4js');
log4js.configure({
    appenders: { pakLogger: { type: "file", filename: logPath } },
    categories: { default: { appenders: ["pakLogger"], level: "debug" } },
  });
var pakLogger = log4js.getLogger("pakLogger");


function prepareTempDir() {
    if (!fs.existsSync(temp_path)) {
        fs.mkdirSync(temp_path);
    }
    else {
        if (fs.existsSync(modDestPath)) {
            fs.unlinkSync(modDestPath);
        }
    }
}


async function processPak(modPath) {
    var build = new LSLIB.PackageBuildData();
    var Packager = new LSLIB.Packager();

    try {
        console.log(path.basename(modPath));
        console.log(modDestPath);
        await Packager.CreatePackage(modDestPath, modPath, build);
        
    }
    catch (error) {
        console.error(error);
    }

    pakLogger.debug("%s%s exported to %s", modName, pak, modDestPath);
}

module.exports = { processPak, prepareTempDir }