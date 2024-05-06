const path = require('path');
const vscode = require('vscode');

const { LSLIB, getFormats } = require('./lslib_utils');
const { CREATE_LOGGER } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER(); 

const { xml, loca } = getFormats();

var to_loca;


function isLoca(ext) {
    return ext == xml || ext == loca;
}


function getLocaOutputPath(filePath) {
    var source_ext = path.extname(filePath);

    var temp = filePath.substring(0, (filePath.length - source_ext.length));
    
    if (source_ext == xml) {
        to_loca = loca;
    }
    else {
        to_loca = xml;
    }

    temp = path.normalize(temp + to_loca);
    return temp;
}


function processLoca(file, targetExt) {
    var LocaUtils = LSLIB.LocaUtils;
    var file_output;
    var temp_loca;

    try {
        file_output = getLocaOutputPath(file);
        bg3mh_logger.debug("Converting %s file %s to format %s", targetExt, file, to_loca);

        temp_loca = LocaUtils.Load(file);

        LocaUtils.Save(temp_loca, file_output);
        bg3mh_logger.debug("Exported %s file: %s", to_loca, file_output);
    }
    catch (Error) {
        vscode.window.showErrorMessage(`${Error}`);
        console.error(Error);
    }
}


module.exports = { isLoca, processLoca, getLocaOutputPath, to_loca };

