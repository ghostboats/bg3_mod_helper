const vscode = require('vscode');
const fs = require('fs');
const path = require('path')

const { LOAD_LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { LSLIB } = LOAD_LSLIB();
const LocaUtils = LSLIB.LocaUtils;
const LocaFormat = LSLIB.LocaFormat;
// const LocaResource = LSLIB.LocaResource;
// const extension = LocaFormat.extension;

const { getConfig } = require('../../config.js');
const { rootModPath } = getConfig();
const locaSuffix = '\\Localization\\English\\';
const locaPath = path.normalize(rootModPath + locaSuffix);

const { xml, loca } = getFormats();


function testing() {
    console.log("Getting Localization file extension values...");
}


function errorLog(error) {
    console.error(error);
}


async function aReadFile(path) {
    var tempFile = await fs.readFile(path, (error) => {
        errorLog(error);
    });
    return tempFile;
}


function read(filePath) {
    const writeableStream = fs.createWriteStream(filePath);

    writeableStream.on('error', function (error) {
        console.log(`error: ${error.message}`);
    })

    writeableStream.on('data', (chunk) => {
        console.log(chunk);
    })

    return writeableStream;
}


function getOutputPath(filePath, targetExt) {
    var temp = filePath.substring(0, (filePath.length - targetExt.length))
    
    if (targetExt == xml) {
        temp = path.normalize(temp + loca);
    }
    else {
        temp = path.normalize(temp + xml);
    }
    return temp;
}


function convert(targetExt = xml) {
    console.log("Starting convert function....")
    console.log(locaPath);
    var file_output;
    var temp_loca;

    // console.log(xml_test + "\n" + loca_test)

    var filesToConvert = FIND_FILES(locaPath, targetExt);

    console.log(filesToConvert);
    console.log(targetExt);

    for (var i = 0; i < filesToConvert.length; i++) {
        try {
            file_output = getOutputPath(filesToConvert[i], targetExt);
            console.log("Converting file: " + filesToConvert[i]);

            temp_loca = LocaUtils.Load(filesToConvert[i]);

            LocaUtils.Save(temp_loca, file_output);
            console.log("Exported loca file: " + file_output);
        }
        catch (error) {
            console.error(error);
        }

    }
}


module.exports = { 
    testing, convert
};

