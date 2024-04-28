// what's your function
const path = require('path')
const fs = require('fs');
const vscode = require('vscode');

const { FIND_FILES, getFormats } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { getConfig } = require('./config.js');
const { rootModPath } = getConfig();
const compatRootModPath = path.normalize(rootModPath + "\\");

const { CREATE_LOGGER } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath, to_lsf } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./pack_mod');


function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}


function convert(convertPath = getActiveTabPath(), targetExt = path.extname(convertPath)) {
    if (targetExt == pak) {
        prepareTempDir();
        convert(compatRootModPath, xml);
        convert(compatRootModPath, lsx);
        processPak(compatRootModPath);
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
        }
        else {
            bg3mh_logger.error("%s is not a recognized directory or loca file.", convertPath);
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
        }
        else {
            bg3mh_logger.error("%s is not a recognized directory or lsf file.", convertPath);
            return;
        }
    }
}


module.exports = { convert, compatRootModPath }