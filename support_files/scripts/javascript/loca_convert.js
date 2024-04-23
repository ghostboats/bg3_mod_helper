const fs = require('fs');
const vscode = require('vscode');
const path = require('path')

const { LOAD_LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { LSLIB } = LOAD_LSLIB();
const LocaUtils = LSLIB.LocaUtils;

const { getConfig } = require('../../config.js');
const { rootModPath } = getConfig();
const locaSuffix = '\\Localization\\English\\';

const { xml, loca } = getFormats();

var to_loca;


function testing() {
    console.log(vscode.window.activeTextEditor.document.fileName);
}


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


function processLoca(file, targetExt) {
    var file_output;
    var temp_loca;
    try {
        file_output = getLocaOutputPath(file);
        console.log("Converting %s file %s to format %s", targetExt, file, to_loca);

        temp_loca = LocaUtils.Load(file);

        LocaUtils.Save(temp_loca, file_output);
        console.log("Exported %s file: %s", to_loca, file_output);
    }
    catch (error) {
        console.error(error);
    }
}


module.exports = { 
    isLoca, testing, processLoca, getLocaOutputPath, locaSuffix,
};

