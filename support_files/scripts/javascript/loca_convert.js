const fs = require('fs');
const vscode = require('vscode');
const path = require('path')

const { LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { logPath } = require('./log_utils'); 

const { xml, loca } = getFormats();

const log4js = require('log4js');
log4js.configure({
    appenders: { locaLogger: { type: "file", filename: logPath } },
    categories: { default: { appenders: ["locaLogger"], level: "debug" } },
  });

var to_loca;
var locaLogger = log4js.getLogger("locaLogger");


function isLoca(ext) {
    return ext == xml || ext == loca;
}


function errorLog(error) {
    console.error(error);
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

// shrimple

// dotnet.load(shrimple)

// SMOGE
function processLoca(file, targetExt) {
    var LocaUtils = LSLIB.LocaUtils;
    var file_output;
    var temp_loca;

    try {
        file_output = getLocaOutputPath(file);
        locaLogger.debug("Converting %s file %s to format %s", targetExt, file, to_loca);

        temp_loca = LocaUtils.Load(file);

        LocaUtils.Save(temp_loca, file_output);
        locaLogger.debug("Exported %s file: %s", to_loca, file_output);
    }
    catch (error) {
        console.error(error);
    }
}


module.exports = { isLoca, processLoca, getLocaOutputPath, to_loca };

