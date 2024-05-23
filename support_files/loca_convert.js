const path = require('path');
const vscode = require('vscode');

const { getFormats, baseNamePath } = require('./lslib_utils');
const { CREATE_LOGGER, raiseError, raiseInfo } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER(); 

const { xml, loca } = getFormats();

var to_loca;


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
    const LSLIB = await require('./lslib_utils').LOAD_LSLIB();
    var LocaUtils = LSLIB.LocaUtils;
    var file_output;
    var temp_loca;

    try {
        file_output = getLocaOutputPath(file);
        bg3mh_logger.info("Converting %s file %s to format %s", targetExt, file, to_loca);

        temp_loca = LocaUtils.Load(file);

        LocaUtils.Save(temp_loca, file_output);
        raiseInfo(`Exported ${to_loca} file: ${file_output}`)
    }
    catch (Error) { 
        raiseError(Error);
    }
}


module.exports = { isLoca, processLoca, getLocaOutputPath, to_loca };

