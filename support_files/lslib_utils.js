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
const { CREATE_LOGGER } = require('./log_utils.js')
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

// excluding these packs because lslib uses something else to unpack them
const virtualTextureRegex = /Textures_[\d]+/;
const hotfixPatchRegex = /Patch[\d]+_Hotfix[\d]+/;

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
    getConfig = workerData.workerConfig;
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


// run through the created DLLS array and load each one
async function loadDlls() {
    for (let i = 0; i < DLL_PATHS.length; i++) {
        try {
            dotnet.load(path.normalize(DLL_PATHS[i]));
        }
        catch (Error) {
            bg3mh_logger.error(Error);
        }
    }
}


// handles the finding of LSLib. logs will be created wherever this loads from.
async function LOAD_LSLIB() {
    // first step is to find all the dlls in the folder the user has specified for lslibPath. note the differences between the main thread and the worker thread.
    if (isMainThread) {
        if (fs.existsSync(path.join(lslibPath, LSLIB_DLL))) {
            DLL_PATHS = await FIND_FILES(getFormats().dll, lslibPath);
        }
        else if (fs.existsSync(path.join(lslibToolsPath, LSLIB_DLL))) {
            DLL_PATHS = await FIND_FILES(getFormats().dll, lslibToolsPath);
        } 
        else {
            bg3mh_logger.error("LSLib.dll not found at " + lslibPath + ".");
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
            bg3mh_logger.error("LSLib.dll not found at " + lslibPath + ".");
            return null;
        }
    }

    // normalize the paths and load them into the dotnet api variable
    await loadDlls();
    if (isMainThread) {
        bg3mh_logger.info(`${DLL_PATHS} \n.dlls loaded`);
    } else {
        bg3mh_logger.info(`.dlls loaded into worker ${workerData.workerId}`)
    }
    
    // have to ignore this because the ts-linter doesn't know 'LSLib' exists :starege:
    // @ts-ignore 
    return dotnet.LSLib.LS;
}


// synchronously returns an array with the absolute paths to every file found with the target file extension.
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


// beautiful. still needs dll handling in lslib_utils though, and some refactoring
async function FIND_FILES(targetExt = getFormats().lsf, filesPath = '**/*') {
    let filesList;
    let nonRecursiveGlob = '*';
    let recursiveGlob = '**/*'

    // finding dlls needs to not be recursive so we don't accidentally load things twice
    if (targetExt === getFormats().dll) {
        let dllDir = new vscode.RelativePattern(filesPath, '*' + targetExt);
        filesList = (await findFiles(dllDir)).map(file =>  dirSeparator(file.path));
    }
    // paks can be recursive, but we need to account for them not being in the workspace, like dlls
    else if (targetExt === getFormats().pak) {
        let dllDir = new vscode.RelativePattern(filesPath, '**/*' + targetExt);
        filesList = (await findFiles(dllDir)).map(file => dirSeparator(file.path));
    }
    else {
        filesList = (await findFiles(filesPath + targetExt)).map(file => dirSeparator(file.path));
    }

    return FILTER_PATHS(filesList);
}


function FILTER_PATHS(filesPath) {
    let excludedFiles = [];
    if (isMainThread) {
        excludedFiles = getConfig().excludedFiles;
    } else {
        excludedFiles = getConfig.excludedFiles;
    }
    
    // if filesPath is an array, break it up into single files and send it back through this function for the second step
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
    // if file path is a string, indicating a single path, loop through each directory and name, checking for reasons to exclude it 
    else if (typeof(filesPath) == 'string') {
        let temp_path = filesPath.split(path.sep);
        let temp_ext = path.extname(filesPath);

        for (let i = 0; i < temp_path.length; i++) {
            let temp_name = path.basename(filesPath, getFormats().pak)
            // these if statements could technically be combined, but that doesn't make it very readable.
            if (temp_ext === getFormats().dll && !illegalDlls.includes(path.basename(filesPath))) {
                return filesPath;
            }
            // if paks are being grabbed, it's for unpacking, so exclude the ones that throw errors
            else if (temp_ext === getFormats().pak && !(virtualTextureRegex.test(temp_name) || hotfixPatchRegex.test(temp_name))) {
                return filesPath;

            }
            // check if an item is excluded by user, in a path that should be converted, or can be ignored
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
function moveFileAcrossDevices(sourcePath, destPath, bg3mh_logger) {
    let infoMsg = `${path.basename(sourcePath)} moved to ${destPath}.`;

    fs.readFile(sourcePath, (readErr, data) => {
        if (readErr) {
            bg3mh_logger.error(readErr);
            return;
        }
        fs.writeFile(destPath, data, (writeErr) => {
            if (writeErr) {
                bg3mh_logger.error(writeErr);
                return;
            }
            fs.unlink(sourcePath, unlinkErr => {
                // added the check because it was raising an error every time the func was called
                if (unlinkErr) {
                    bg3mh_logger.error(unlinkErr);
                    return;
                }
            });
        });
    });
    
    if (isMainThread) {
        bg3mh_logger.info(infoMsg, false);
        vscode.window.showInformationMessage(infoMsg);
    } else {
        bg3mh_logger.info(infoMsg, false);
    }
}

// i don't like putting this here but i need a worker_thread friendly version
function getModNameSync() {
    let rootModPath;

    if (isMainThread) {
        rootModPath = getConfig().rootModPath;
    } else {
        rootModPath = getConfig.rootModPath;
    }

    let modsDirPath = path.join(rootModPath, 'Mods');

    try {
        if (!fs.existsSync(modsDirPath)) {
            if (isMainThread) {
                vscode.window.showErrorMessage('Mods directory does not exist.');
            } else {
                bg3mh_logger.error('Mods directory does not exist.');
            }
            
            return '';
        }

        const files = fs.readdirSync(modsDirPath);
        const directories = files.filter(file => 
            fs.statSync(path.join(modsDirPath, file)).isDirectory()
        );

        if (directories.length === 1) {
            return directories[0];
        } else {
            return '';
        }
    } catch (error) {
        if (isMainThread) {
            vscode.window.showErrorMessage(`Error reading directories in ${modsDirPath}: ${error}`);
        } else {
            bg3mh_logger.error(`Error reading directories in ${modsDirPath}: ${error}`);
        }
        
        return '';
    }
}


module.exports = { LSLIB, LOAD_LSLIB, FIND_FILES, FIND_FILES_SYNC, FILTER_PATHS, getFormats, moveFileAcrossDevices, baseNamePath, dirSeparator, compatRootModPath, getModNameSync };