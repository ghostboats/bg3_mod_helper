// what's your function
const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const { FIND_FILES, getFormats, compatRootModPath } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { getConfig } = require('./config.js');
const { rootModPath } = getConfig();

const { CREATE_LOGGER } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath, to_lsf } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./pack_mod');


function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}


function convert(convertPath = getActiveTabPath(), targetExt = path.extname(convertPath)) {
    console.log("4 %s in convert() in conversion_junction.js", rootModPath);
    try {
        if (Array.isArray(convertPath) && targetExt == "arr") {
            for (var i = 0; i < convertPath.length; i++) {
                console.log(convertPath[i]);
                convert(convertPath[i], path.extname(convertPath[i]));
            }
        }
        else if (targetExt == pak) {
            console.log("5 %s in pak check in conversion_junction.js", rootModPath); 

            prepareTempDir();
            convert(compatRootModPath, xml);
            convert(compatRootModPath, lsx);
            processPak(compatRootModPath);
        }
        else if (isLoca(targetExt)) {
            console.log("6 %s converting loca");
            console.log(convertPath);
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
            console.log("7 %s converting lsf")
            if (fs.lstatSync(convertPath).isDirectory()) {
                var filesToConvert = FIND_FILES(convertPath, targetExt);

                for (var i = 0; i < filesToConvert.length; i++) {
                    processLsf(filesToConvert[i], targetExt);
                }
            }
            else if (fs.lstatSync(convertPath).isFile()) {
                processLsf(convertPath, targetExt);
            }
            else {
                console.error("%s is not a recognized directory or lsf file.", convertPath);
                return;
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}


module.exports = { convert }