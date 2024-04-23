/*
job of this file is to expose LSLib and provide commonly-used functions in conversion
*/
const dotnet = require('node-api-dotnet/net8.0');

const fs = require('fs');
const path = require('path');

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();

const LSLIB_DLL = '\\LSLib.dll';
const TOOL_DIR = path.join('\\Tools' + LSLIB_DLL);

var sys;
var LSLIB;
var LSLIB_PATH;
var xml_format = ".xml";
var loca_format = ".loca";


function getFormats() {
    return {
        loca: ".loca",
        xml: ".xml",
        lsf: "lsf",
        lsx: "lsx",
        lsfx: "lsfx"
    }
}


function LOAD_LSLIB() {
    if (fs.existsSync(path.join(divinePath + LSLIB_DLL)))
    {
        LSLIB_PATH = path.join(divinePath + LSLIB_DLL);
        console.log("LSLib.dll found at " + LSLIB_PATH + ".");
    }
    else if (fs.existsSync(path.join(divinePath + TOOL_DIR))) {
        LSLIB_PATH = path.join(divinePath + TOOL_DIR);
        console.log("LSLib.dll found at " + LSLIB_PATH + ".");
    } 
    else {
        console.error("LSLib.dll not found at " + divinePath + ".");
        LSLIB_PATH = null;
        LSLIB = null;
        return;
    }

    try {
        console.log("trying to load lslib...");
        dotnet.load(LSLIB_PATH);
        console.log ("LSLib.dll loaded from " + LSLIB_PATH + ".");
        
        // @ts-ignore
        // have to ignore these because the ts-linter doesn't know 'LSLib' exists :| 
        LSLIB = dotnet.LSLib.LS;
    }
    catch (Error) {
        console.error("Error!");
        console.error(Error);
    }

    return { 
        LSLIB, LSLIB_PATH
    }
}


function FIND_FILES(filesPath, targetExt = xml_format) {
    var filesToConvert = [];
    var filesList = fs.readdirSync(filesPath, {
        withFileTypes: false,
        recursive: true,
    });

    for (var i = 0; i < filesList.length; i++) {
        var temp = filesList[i].toString();
        if (path.extname(temp) == targetExt) {
            filesToConvert.push(filesPath + filesList[i]);
        }
    }

    return filesToConvert;
}


module.exports = { LOAD_LSLIB, FIND_FILES, getFormats };