// what's your function
const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const { FIND_FILES, getFormats } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { CREATE_LOGGER, raiseError, raiseInfo } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER(); 

const { getConfig } = require('./config.js');

const { getModName } = require('./helper_functions.js');

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./process_pak');


function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}


function getDynamicPath(filePath) {
    let temp_path;

    if (Array.isArray(filePath) && filePath != []) {
        temp_path = filePath[0];
    }
    else if (typeof(filePath) == 'string') {
        temp_path = filePath;
    }
    else {
        temp_path = getActiveTabPath();
    }

    if (temp_path === undefined) {
        return "null.empty";
    }
    return temp_path;
}


async function convert(convertPath, targetExt = path.extname(getDynamicPath(convertPath)), modName_ = '') {
    const { rootModPath } = getConfig();

    console.log('targetExt:' + targetExt);
    if (targetExt === "empty") {
        return;
    }

    if (targetExt === pak) {
        if (fs.statSync(convertPath).isDirectory()) {
            prepareTempDir();

            await convert(rootModPath, xml)
                .then(() => raiseInfo(`xml conversion done`, false));

            await convert(rootModPath, lsx)
                .then(() => raiseInfo(`lsx conversion done`, false));

            processPak(rootModPath, modName_);
        }
        else if (fs.statSync(convertPath).isFile()) {
            processPak(convertPath, modName_, 'n/a');
        }
    } 
    else if (Array.isArray(convertPath)) {
        // console.log('array1')
        for (let i = 0; i < convertPath.length; i++) {
            convert(convertPath[i], path.extname(convertPath[i]));
        }
    } 
    else if (fs.statSync(convertPath).isDirectory()) {
        // console.log('plz1')
        const filesToConvert = await FIND_FILES(targetExt);
        convert(filesToConvert);
    } 
    else if (fs.statSync(convertPath).isFile()) {
        // console.log('plz2')
        if (isLoca(targetExt)) {
            try {
                processLoca(convertPath, targetExt);
            } 
            catch (Error) {
                raiseError(Error);
                return;
            }
        } 
        if (isLsf(targetExt)) {
            try {
                processLsf(convertPath, targetExt);
            } 
            catch (Error) {
                raiseError(Error);
                return;
            }
        }
    }
}


module.exports = { convert };