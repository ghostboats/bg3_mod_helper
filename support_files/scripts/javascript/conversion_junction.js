// what's your function
const path = require('path')
const fs = require('fs');
const vscode = require('vscode');

const { LOAD_LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
// const { LSLIB } = LOAD_LSLIB();
const { lsx, lsf, lsfx, xml, loca } = getFormats();

const { getConfig } = require('../../config.js');
const { rootModPath } = getConfig();

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf } = require('./lsf_convert')
// const locaSuffix = '\\Localization\\English\\';


function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}


function convert(convertPath = getActiveTabPath(), targetExt = path.extname(convertPath)) {
    console.log("Starting converter function...");

    if (isLoca(targetExt)) {
        if (fs.lstatSync(convertPath).isDirectory()) {
            var filesToConvert = FIND_FILES(convertPath, targetExt);

            for (var i = 0; i < filesToConvert.length; i++) {
                processLoca(filesToConvert[i], targetExt);
            }
        }
        else if (fs.lstatSync(convertPath).isFile()) {
            processLoca(convertPath, targetExt);
        }
        else {
            console.error("%s is not a recognized directory or loca file.", convertPath);
            return;
        }
    }
    else if (isLsf(targetExt)) {
        console.log("hi from the lsf processor");
    }

}


function convertActiveWindow() {
    console.log(vscode.window.activeTextEditor.document.fileName);
    
    var activeFile = vscode.window.activeTextEditor.document.fileName;
    var activeFileExt = path.extname(activeFile);

    console.log("%s\n%s", activeFile, activeFileExt);

    if (activeFileExt == xml || activeFileExt == loca) {
        var activeFileOutput = getLocaOutputPath(activeFile);
        var activeFileOutputExt = path.extname(activeFileOutput);

        processLoca(activeFile, activeFileOutputExt);
    }

}


module.exports = { convert }