const path = require('path');

const { getFormats, baseNamePath, LOAD_LSLIB } = require('./lslib_utils');
const { CREATE_LOGGER } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER();

const { xml, loca } = getFormats();

var to_loca;
var LSLIB;

async function lslib_load() {
    if (LSLIB === undefined) {
        bg3mh_logger.info("lslib not found. loading...", false);
        LSLIB = await LOAD_LSLIB();
        // console.log(typeof(LSLIB))
    } else {
        bg3mh_logger.info("lslib is already loaded!", false);
    }
}


function isLoca(ext) {
    return ext == xml || ext == loca;
}


function getLocaOutputPath(filePath) {
    to_loca = "";
    var source_ext = path.extname(filePath);
    var temp = baseNamePath(filePath, source_ext);

    if (source_ext == xml) {
        to_loca = loca;
    }
    else {
        to_loca = xml;
    }

    temp = path.normalize(temp + to_loca);
    return temp;
}


async function processLoca(file, targetExt) {
    var LocaUtils = LSLIB.LocaUtils;
    var file_output;
    var temp_loca;

    try {
        file_output = getLocaOutputPath(file);
        bg3mh_logger.info("Converting %s file %s to format %s", targetExt, file, to_loca);

        temp_loca = LocaUtils.Load(file);

        LocaUtils.Save(temp_loca, file_output);
        bg3mh_logger.info(`Exported ${to_loca} file: ${file_output}`)
    }
    catch (Error) { 
        bg3mh_logger.error(Error);
    }
}

lslib_load();
module.exports = { isLoca, processLoca, getLocaOutputPath, to_loca };

