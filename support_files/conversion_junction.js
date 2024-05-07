// what's your function
const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const { FIND_FILES, getFormats } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { CREATE_LOGGER, raiseError } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER();

const { getConfig } = require('./config.js');
const { rootModPath, modName, modDestPath, excludedFiles } = getConfig();
const modExtName  = modName + pak;

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./pack_mod');


function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}


function convert(convertPath = getActiveTabPath(), targetExt = path.extname(convertPath)) {
    const { excludedFiles } = getConfig();
    bg3mh_logger.info(`Excluded Files: ${JSON.stringify(excludedFiles, null, 2)}`);
    console.log(`Excluded Files: ${JSON.stringify(excludedFiles, null, 2)}`);
    try {
        if (Array.isArray(convertPath) && targetExt == "arr") {
            for (var i = 0; i < convertPath.length; i++) {
                console.log(convertPath[i])
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
            if (fs.lstatSync(convertPath).isDirectory()) {
                var filesToConvert = FIND_FILES(convertPath, targetExt);

                for (var i = 0; i < filesToConvert.length; i++) {
                    processLoca(filesToConvert[i], targetExt);
                }
            }
            else if (fs.lstatSync(convertPath).isFile()) {
                processLoca(convertPath, targetExt);
                vscode.window.showInformationMessage(`Exported ${getLocaOutputPath(convertPath)} correctly.`);
            }
            else {
                raiseError(convertPath + " is not a recognized directory or loca file.", false);
                vscode.window.showErrorMessage(`${convertPath} is not a recognized directory or loca file.`);
                return;
            }
        }
        else if (isLsf(targetExt)) {
            if (fs.lstatSync(convertPath).isDirectory()) {
                var filesToConvert = FIND_FILES(convertPath, targetExt);

                for (var i = 0; i < filesToConvert.length; i++) {
                    processLsf(filesToConvert[i], targetExt);
                }
            }
            else if (fs.lstatSync(convertPath).isFile()) {
                processLsf(convertPath, targetExt);
                vscode.window.showInformationMessage(`Exported ${getLsfOutputPath(convertPath)} correctly.`);
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