/*
    job of this file is to expose LSLib and provide commonly-used functions and vars in conversion
    
    TODO: auto-update LSLib from github 
*/

const fs = require('fs');
const path = require('path');

// loads the api
const dotnet = require('node-api-dotnet/net8.0');
/*
    const dotnet_elastic = require('node-api-dotnet/net8.0');
    const story_compiler = require('node-api-dotnet/net8.0');
    const converter_app = require('node-api-dotnet/net8.0');
*/

const LSLIB_DLL = 'LSLib.dll';
const TOOL_SUBDIR = 'Tools\\';
const { CREATE_LOGGER } = require('./log_utils.js')
const bg3mh_logger = CREATE_LOGGER();

const { getConfig }  = require('./config.js');
const compatRootModPath = path.join(getConfig().rootModPath + "\\");
const divinePath = path.join(getConfig().divinePath);
const divineToolsPath = path.join(getConfig().divinePath, TOOL_SUBDIR);
const elasticDlls = ['Elastic.Transport.dll', 'Elastic.Clients.Elasticsearch.dll'];
const storyCompilerDll = ['StoryCompiler.dll', 'StoryDecompiler.dll'];
const converterAppDll = ['ConverterApp.dll'];

var DLLS = [];
var DLL_PATHS = [];


function getFormats() {
    return {
        dll: ".dll",
        loca: ".loca",
        xml: ".xml",
        lsb: ".lsb",
        lsf: ".lsf",
        lsj: ".lsj",
        lsfx: ".lsfx",
        lsbc: ".lsbc",
        lsbs: ".lsbs",
        lsx: ".lsx",
        pak: ".pak"
    }
}


// makes sure the path is normalized to the user's system, and then pushes that on to DLLS
function processDllPaths() {
    for (let i = 0; i < DLL_PATHS.length; i++) {
        var temp_path = path.normalize(DLL_PATHS[i]);
        var temp_name = path.basename(temp_path);

        try {
            DLLS.push(temp_path);
            bg3mh_logger.debug("%s found at %s", temp_name, temp_path);
        }
        catch (Error) {
            console.error(Error);
        }
    }
}


// run through the created DLLS array and load each one
function loadDlls() {
    for (let i = 0; i < DLLS.length; i++) {
        try {
            let temp_name = path.basename(DLLS[i]);

            /* leaving this here for now, in case i find a quick solution
                if (elasticDlls.includes(temp_name)) {
                    console.log("%s going into dotnet_elastic", temp_name);
                    // dotnet_elastic.load(DLLS[i]);
                }
                else if (storyCompilerDll.includes(temp_name)) {
                    console.log("%s going into story_compiler", temp_name);
                    // story_compiler.load(DLLS[i]);
                }
                else if (converterAppDll.includes(temp_name)) {
                    console.log("%s going into converter_app", temp_name);
                    // converter_app.load(DLLS[i]);
                } 
            */

            if (!converterAppDll.includes(temp_name) && !storyCompilerDll.includes(temp_name) && !elasticDlls.includes(temp_name)) {
                dotnet.load(DLLS[i]);
                bg3mh_logger.debug("%s loaded.", DLLS[i]);
            }
        }
        catch (Error) {
            console.error(Error);
        }
    }
}


// handles the finding of LSLib. logs will be created wherever this laods from.
function LOAD_LSLIB() {
    if (fs.existsSync(path.join(divinePath, LSLIB_DLL))) {
        DLL_PATHS = FIND_FILES(divinePath, getFormats().dll, false);
    }
    else if (fs.existsSync(path.join(divineToolsPath, LSLIB_DLL))) {
        DLL_PATHS = FIND_FILES(divineToolsPath, getFormats().dll, false);
    } 
    else {
        console.error("LSLib.dll not found at " + divinePath + ".");
        return null;
    }
        processDllPaths();    
        loadDlls();

    // have to ignore this because the ts-linter doesn't know 'LSLib' exists :starege:
    // @ts-ignore 
    return dotnet.LSLib.LS;
}


// returns an array with the absolute paths to every file found with the target file extension.
// maybe replace with findFiles()? 
function FIND_FILES(filesPath, targetExt = getFormats().lsf, isRecursive = true) {
    var filesToConvert = [];
    var filesList = fs.readdirSync(filesPath, {
        withFileTypes: false,
        recursive: isRecursive,
    });

    for (var i = 0; i < filesList.length; i++) {
        var temp = filesList[i].toString();
        if (path.extname(temp) == targetExt) {
            // toString() is needed here to conver the string[] | Buffer[] from readdirSync
            filesToConvert.push(path.join(filesPath, filesList[i].toString()));
        }
    }

    return filesToConvert;
}

// here in case people (i'm people) have their working directory and their AppData on different hard drives.
function moveFileAcrossDevices(sourcePath, destPath, callback = error => console.error(error)) {
    fs.readFile(sourcePath, (readErr, data) => {
        if (readErr) {
            callback(readErr);
            return;
        }
        fs.writeFile(destPath, data, (writeErr) => {
            if (writeErr) {
                callback(writeErr);
                return;
            }
            fs.unlink(sourcePath, unlinkErr => {
                callback(unlinkErr);
            });
        });
    });
}


const LSLIB = LOAD_LSLIB();

module.exports = { LSLIB, FIND_FILES, getFormats, moveFileAcrossDevices, compatRootModPath };