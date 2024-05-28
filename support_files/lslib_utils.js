/*
    job of this file is to expose LSLib and provide commonly-used functions and vars in conversion
    
    TODO: auto-update LSLib from github 
*/
const path = require('path');
const fs = require('fs');


// loads the api
const dotnet = require('node-api-dotnet/net8.0');
/*
    const dotnet_elastic = require('node-api-dotnet/net8.0');
    const story_compiler = require('node-api-dotnet/net8.0');
    const converter_app = require('node-api-dotnet/net8.0');
*/

const LSLIB_DLL = 'LSLib.dll';
const TOOL_SUBDIR = 'Tools\\';
const { CREATE_LOGGER, raiseError, raiseInfo } = require('./log_utils.js')
const bg3mh_logger = CREATE_LOGGER();

// separated for future use
const elasticDlls = ['Elastic.Transport.dll', 'Elastic.Clients.Elasticsearch.dll'];
const storyCompilerDlls = ['StoryCompiler.dll', 'StoryDecompiler.dll'];
const converterAppDll = ['ConverterApp.dll'];
const illegalDlls = [].concat(elasticDlls, storyCompilerDlls, converterAppDll);

// the list of directories that need lsx > lsf conversion
const convertDirs = ["[PAK]_UI", "[PAK]_Armor", "RootTemplates", "MultiEffectInfos", "Assets", "UI", "Effects", "LevelMapValues", "Localization"];

// excluding this because it will match to "UI" in convertDirs
const illegalFiles = ["Icons_Items.lsx"];

// tools to test where the process is
const { isMainThread, workerData } = require('node:worker_threads');

var DLLS = [];
var DLL_PATHS, LSLIB, lslibPath, compatRootModPath, lslibToolsPath, vscode, findFiles, parse;
var getConfig;


if (isMainThread) {
    getConfig = require('./config.js').getConfig;
    lslibPath = getConfig().lslibPath;
    compatRootModPath = path.join(getConfig().rootModPath + "\\");
    lslibToolsPath = path.join(getConfig().lslibPath, TOOL_SUBDIR);
    vscode = require('vscode');
    findFiles = vscode.workspace.findFiles;
    parse = vscode.Uri.parse;
} else {
    getConfig = workerData;
    lslibPath = getConfig.lslibPath;
    compatRootModPath = path.join(getConfig.rootModPath + "\\");
    lslibToolsPath = path.join(getConfig.lslibPath, TOOL_SUBDIR);
}


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


function dirSeparator(filePath) {
    filePath = path.normalize(filePath);
    if (filePath[0] == "/" || filePath[0] == "\\") {
        return filePath.slice(1, filePath.length).toString();
    }
    return filePath.toString();
}

// returns the given path, minus the file extension (ie. \home\shiela\doc.txt > \home\shiela\doc)
function baseNamePath(filePath, ext) {
    return filePath.substring(0, (filePath.length - ext.length));
}


// makes sure the path is normalized to the user's system, and then pushes that on to DLLS
function processDllPaths() {
    for (let i = 0; i < DLL_PATHS.length; i++) {
        var temp_path = dirSeparator(path.normalize(DLL_PATHS[i]));

        try {
            DLLS.push(temp_path);
        }
        catch (Error) {
            raiseError(Error);
        }
    }
}


// run through the created DLLS array and load each one
async function loadDlls() {
    for (let i = 0; i < DLLS.length; i++) {
        try {
            dotnet.load(DLLS[i]);
        }
        catch (Error) {
            raiseError(Error);
        }
    }
}


// handles the finding of LSLib. logs will be created wherever this laods from.
async function LOAD_LSLIB() {
    if (isMainThread) {
        if (fs.existsSync(path.join(lslibPath, LSLIB_DLL))) {
            DLL_PATHS = await FIND_FILES(getFormats().dll, lslibPath);
        }
        else if (fs.existsSync(path.join(lslibToolsPath, LSLIB_DLL))) {
            DLL_PATHS = await FIND_FILES(getFormats().dll, lslibToolsPath);
        } 
        else {
            raiseError("LSLib.dll not found at " + lslibPath + ".", false);
            vscode.window.showErrorMessage(`LSLib.dll not found at ${lslibPath}. Are you sure you aren't using the legacy option using divine.exe?`);
            return null;
        }

    } else {
        if (fs.existsSync(path.join(lslibPath, LSLIB_DLL))) {
            DLL_PATHS = FIND_FILES_SYNC(lslibPath, getFormats().dll);
        }
        else if (fs.existsSync(path.join(lslibToolsPath, LSLIB_DLL))) {
            DLL_PATHS = FIND_FILES_SYNC(lslibToolsPath, getFormats().dll);
        } 
        else {
            raiseError("LSLib.dll not found at " + lslibPath + ".");
            return null;
        }
    }

    processDllPaths();    
    await loadDlls();
    bg3mh_logger.info(`${DLL_PATHS} \n.dlls loaded`);
    console.log(`${DLL_PATHS} \n.dlls loaded`);
    
    // have to ignore this because the ts-linter doesn't know 'LSLib' exists :starege:
    // @ts-ignore 
    return dotnet.LSLib.LS;
    
}


// returns an array with the absolute paths to every file found with the target file extension.
// maybe replace with findFiles()? 
function FIND_FILES_SYNC(filesPath, targetExt = getFormats().lsf, isRecursive = true) {
    let filesToConvert = [];

    // console.log(filesPath);
    // console.log(targetExt);

    const filesList = fs.readdirSync(filesPath, {
        withFileTypes: false,
        recursive: isRecursive
    });
    // console.log(filesList);

    for (let i = 0; i < filesList.length; i++) {
        const temp = filesList[i].toString();

        if (path.extname(temp) === targetExt) {
           filesToConvert.push(path.join(filesPath, temp));
        }
    }

    return FILTER_PATHS(filesToConvert);
}


// beautiful. still needs dll handling in lslib_utils though
async function FIND_FILES(targetExt = getFormats().lsf, filesPath = '**/*') {
    let filesList;

    if (targetExt === getFormats().dll) {
        let dllDir = new vscode.RelativePattern(filesPath, '*' + targetExt);
        // console.log(dllDir);
        filesList = (await findFiles(dllDir)).map(file => file.path);
    }
    else if (targetExt === getFormats().pak) {
        let dllDir = new vscode.RelativePattern(filesPath, '**/*' + targetExt);
        // console.log(dllDir);
        filesList = (await findFiles(dllDir)).map(file => dirSeparator(file.path));
    }
    else {
        filesList = (await findFiles(filesPath + targetExt)).map(file => file.path);
    }

    if (targetExt === getFormats().pak) {
        // filesList.map(file => dirSeparator(file));
        return filesList;
    }
    else {
        return FILTER_PATHS(filesList);
    }
}


function FILTER_PATHS(filesPath) {
    let excludedFiles = [];
    if (isMainThread) {
        excludedFiles = getConfig().excludedFiles;
    } else {
        excludedFiles = getConfig.excludedFiles;
    }
    
    if (Array.isArray(filesPath)) {
        let filteredPaths = [];

        for (let i = 0; i < filesPath.length; i++) {
            let temp_path = FILTER_PATHS(path.normalize(filesPath[i]));

            if (temp_path) {
                filteredPaths.push(dirSeparator(path.normalize(temp_path)));
            }
        }
        return filteredPaths;
    }
    else if (typeof(filesPath) == 'string') {
        let temp_path = filesPath.split(path.sep);
        let temp_ext = path.extname(filesPath);

        for (let i = 0; i < temp_path.length; i++) {
            // these statements could technically be combined, but that doesn't make it very readable.
            if (temp_ext === getFormats().dll && !illegalDlls.includes(path.basename(filesPath))) {
                return filesPath;
            }
            else if (
                (
                    !excludedFiles.includes(filesPath) && 
                    convertDirs.includes(temp_path[i]) && 
                    !illegalFiles.includes(path.basename(filesPath))
                )
            ) {
                return filesPath;
            }
        }
    }
}


// here in case people (i'm people) have their working directory and their AppData on different hard drives.
function moveFileAcrossDevices(sourcePath, destPath, raiseError) {
    let infoMsg = `${path.basename(sourcePath)} moved to ${destPath}.`;

    fs.readFile(sourcePath, (readErr, data) => {
        if (readErr) {
            raiseError(readErr);
            return;
        }
        fs.writeFile(destPath, data, (writeErr) => {
            if (writeErr) {
                raiseError(writeErr);
                return;
            }
            fs.unlink(sourcePath, unlinkErr => {
                // added the check because it was raising an error every time the func was called
                if (unlinkErr) {
                    raiseError(unlinkErr);
                    return;
                }
            });
        });
    });
    
    if (isMainThread) {
        raiseInfo(infoMsg, false);
        vscode.window.showInformationMessage(infoMsg);
    } else {
        raiseInfo(infoMsg);
    }
}


module.exports = { LSLIB, LOAD_LSLIB, FIND_FILES, FIND_FILES_SYNC, FILTER_PATHS, getFormats, moveFileAcrossDevices, baseNamePath, dirSeparator, compatRootModPath };