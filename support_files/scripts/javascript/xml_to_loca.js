const path = require('path')

const { LOAD_LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { LSLIB } = LOAD_LSLIB();
const LocaUtils = LSLIB.LocaUtils;

const { getConfig } = require('../../config.js');
const { rootModPath } = getConfig();
const locaSuffix = '\\Localization\\English\\';
const locaPath = path.normalize(rootModPath + locaSuffix);

const { xml, loca } = getFormats();

var to_loca;


function testing() {
    console.log("Getting Localization file extension values...");
}


function errorLog(error) {
    console.error(error);
}


function getLocaOutputPath(filePath) {
    var source_ext = path.extname(filePath);

    var temp = filePath.substring(0, (filePath.length - source_ext.length));
    
    if (source_ext == xml) {
        to_loca = loca;
        temp = path.normalize(temp + to_loca);
        return temp;
    }

    to_loca = xml;
    temp = path.normalize(temp + to_loca);
    return temp;
}


function convert(targetExt = xml) {
    console.log("Starting convert function....")

    var file_output;
    var temp_loca;
    var filesToConvert = FIND_FILES(locaPath, targetExt);

    for (var i = 0; i < filesToConvert.length; i++) {
        try {
            file_output = getLocaOutputPath(filesToConvert[i]);
            console.log("Converting %s file %s to format %s", targetExt, filesToConvert[i], to_loca);

            temp_loca = LocaUtils.Load(filesToConvert[i]);

            LocaUtils.Save(temp_loca, file_output);
            console.log("Exported %s file: %s", to_loca, file_output);
        }
        catch (error) {
            console.error(error);
        }
    }
}


module.exports = { 
    testing, convert
};

