/*
job of this file is to expose LSLib and provide commonly-used functions and vars in conversion
*/
const fs = require('fs');
const path = require('path');

const dotnet = require('node-api-dotnet/net8.0');

const LSLIB_DLL = 'LSLib.dll';
const LSLIBNATIVE_DLL = 'LSLibNative.dll';
const ZSTDSHARP_DLL = 'ZstdSharp.dll';
const LZ4_DLL = 'LZ4.dll'
const TOOL_SUBDIR = 'Tools\\';

const { getConfig }  = require('../../config.js');
const divinePath = path.normalize(getConfig().divinePath + "\\");
const divineToolsPath = path.normalize(getConfig().divinePath + "\\" + TOOL_SUBDIR);

var LSLIB_PATH;

const DLLS = [LSLIB_DLL, LSLIBNATIVE_DLL, ZSTDSHARP_DLL, LZ4_DLL];

var DLL_PATHS = [];


function getFormats() {
    return {
        dll: ".dll", // for the future? maybe?
        loca: ".loca",
        xml: ".xml",
        lsb: ".lsb",
        lsf: ".lsf",
        lsj: ".lsj",
        lsfx: ".lsfx",
        lsbc: ".lsbc",
        lsbs: ".lsbs",
        lsx: ".lsx"
    }
}


function getDllPaths(dllDirPath) {
    for (let i = 0; i < DLLS.length; i++) {
        var temp_path = path.join(dllDirPath + DLLS[i]);

        try {
            if (fs.existsSync(temp_path)) {
                DLL_PATHS.push(temp_path);
                console.log("%s found at %s", DLLS[i], DLL_PATHS[i]);
            }
        }
        catch {
            console.error("Error!");
            console.error(Error);
        }
    }
}


function loadDlls() {
    for (let i = 0; i < DLL_PATHS.length; i++) {
        try {
            dotnet.load(DLL_PATHS[i]);
            console.log("%s loaded.", DLLS[i]);
        }
        catch {
            console.error("Error!");
            console.error(Error);
        }
    }
}


function LOAD_LSLIB() {
    var tempLSLIB;

    if (fs.existsSync(path.join(divinePath + LSLIB_DLL))) {
        getDllPaths(divinePath);
    }
    else if (fs.existsSync(path.join(divineToolsPath + LSLIB_DLL))) {
        getDllPaths(divineToolsPath);
    } 
    else {
        console.error("LSLib.dll not found at " + divinePath + ".");
        LSLIB_PATH = null;
        tempLSLIB = null;
        return;
    }        
        loadDlls();
        // @ts-ignore
        // have to ignore these because the ts-linter doesn't know 'LSLib' exists :starege: 
        tempLSLIB = dotnet.LSLib.LS;
        // LSLib should always be at [0] because of its position in DLLS[].
        LSLIB_PATH = DLL_PATHS[0];

    return tempLSLIB;
}


function FIND_FILES(filesPath, targetExt = getFormats().lsf) {
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


const LSLIB = LOAD_LSLIB();


module.exports = { LSLIB, FIND_FILES, getFormats };