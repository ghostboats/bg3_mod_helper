// what's your function
const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const { FIND_FILES, getFormats } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { raiseError } = require('./log_utils');

const { getConfig } = require('./config.js');
const { rootModPath, modName, modDestPath, excludedFiles } = getConfig();

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./pack_mod');


function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}

// this should be refactored in next release
function convert(convertPath = getActiveTabPath(), targetExt = path.extname(convertPath)) {
    const { excludedFiles } = getConfig();
    convertPath = convertPath.toString();
    //bg3mh_logger.info(`Excluded Files: ${JSON.stringify(excludedFiles, null, 2)}`);
    //console.log(`Excluded Files: ${JSON.stringify(excludedFiles, null, 2)}`);
    try {
        if (Array.isArray(convertPath) && targetExt == "arr") {
            for (var i = 0; i < convertPath.length; i++) {
                convert(convertPath[i], path.extname(convertPath[i]));
            }
        }
        else if (targetExt == pak) { 
            prepareTempDir();

            convert(rootModPath, xml);
            convert(rootModPath, lsx);
            processPak(rootModPath);
        }
        else if (isLoca(targetExt)) {
            if (fs.statSync(convertPath).isDirectory()) {
                var filesToConvert = FIND_FILES(convertPath, targetExt);

                for (var i = 0; i < filesToConvert.length; i++) {
                    try {
                        processLoca(filesToConvert[i], targetExt); 
                    }
                    catch (Error) {
                        raiseError(Error);
                        return;
                    }
                }
            }
            else if (fs.statSync(convertPath).isFile()) {
                try {
                    processLoca(convertPath, targetExt); 

                    if (!Error) {
                        vscode.window.showInformationMessage(`Exported ${getLocaOutputPath(convertPath)} correctly.`);
                    }
                }
                catch (Error) {
                    raiseError(Error);
                    return;
                }
            }
            else {
                raiseError(convertPath + " is not a recognized directory or loca file.", false);
                vscode.window.showErrorMessage(`${convertPath} is not a recognized directory or loca file.`);
                return;
            }
        }
        else if (isLsf(targetExt)) {
            if (fs.statSync(convertPath).isDirectory()) {
                var filesToConvert = FIND_FILES(convertPath, targetExt);

                for (var i = 0; i < filesToConvert.length; i++) {  
                    try {
                        processLsf(filesToConvert[i], targetExt); 
                    }
                    catch (Error) {
                        raiseError(Error);
                        return;
                    }
                }
            }
            else if (fs.statSync(convertPath).isFile()) {
                try {
                    processLsf(convertPath, targetExt); 

                    if (!Error) {
                        vscode.window.showInformationMessage(`Exported ${getLsfOutputPath(convertPath)} correctly.`);
                    }
                }
                catch (Error) {
                    raiseError(Error);
                    return;
                }
            }
            else {
                raiseError(convertPath + " is not a recognized directory or lsf file.", false);
                vscode.window.showErrorMessage(`${convertPath} is not a recognized directory or lsf file.`);
                return;
            }
        }
    }
    catch (error) { 
        raiseError(error);
    }
}


module.exports = { convert };