// what's your function
const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const { FIND_FILES, getFormats } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { raiseError, raiseInfo } = require('./log_utils');

const { getConfig } = require('./config.js');
const { rootModPath, modName, modDestPath, excludedFiles } = getConfig();

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./pack_mod');

let isList = false;
let isPak = false;

function getActiveTabPath() {
    return vscode.window.activeTextEditor.document.fileName;
}


function getDynamicPath(filePath) {
    let temp_path;
    if (Array.isArray(filePath)) {
        temp_path = filePath[0];
    }
    else if (typeof(filePath) == 'string') {
        temp_path = filePath;
    }
    else {
        temp_path = getActiveTabPath();
    }

    return temp_path;
}


function lastFileCheck(index, length) {
    return (index == length - 1)
}


// this should be refactored in next release
function convert(convertPath, targetExt = path.extname(getDynamicPath(convertPath)), lastFile = false) {
    const { excludedFiles } = getConfig();
    //convertPath = convertPath.toString();

    //bg3mh_logger.info(`Excluded Files: ${JSON.stringify(excludedFiles, null, 2)}`);
    //console.log(`Excluded Files: ${JSON.stringify(excludedFiles, null, 2)}`);

    if (targetExt == pak) {
        isPak = true;
        prepareTempDir();

        convert(rootModPath, xml);
        convert(rootModPath, lsx);
        processPak(rootModPath);
    }
    else if (Array.isArray(convertPath)) {
        console.log("to be converted: %s", convertPath)
        if (convertPath.length == 1) {
            lastFile = lastFileCheck(0, convertPath.length);
            convert(convertPath[0], path.extname(convertPath[0]));
        }
        else if (convertPath.length > 1) {
            console.log("array length is %s", convertPath.length);
            isList = true;
            for (var i = 0; i < convertPath.length; i++) {
                lastFile = lastFileCheck(i, convertPath.length);
                convert(convertPath[i], path.extname(convertPath[i]), lastFile);
            }
        }
    }
    else if (fs.statSync(convertPath).isDirectory()) {
        convert(FIND_FILES(convertPath, targetExt));
    }
    else if (fs.statSync(convertPath).isFile()) {
        if (isLoca(targetExt)) {
            try {
                processLoca(convertPath, targetExt);
            }
            catch (Error) {
                raiseError(Error);
                return;
            }
        }
        else if (isLsf(targetExt)) {
            try {
                processLsf(convertPath, targetExt); 
            }
            catch (Error) {
                raiseError(Error);
                return;
            }
        }
        
        if (!lastFile && !isList && !isPak) {
            lastFile = true;
        }
    }

    console.log("%s\n%s\n%s", lastFile, isPak, isList);

    if (!lastFile) {
        if (!isPak && isList) {
            console.log("%s is not a pak and is a list", convertPath);
            raiseInfo(`${modName} ${targetExt} files converted successfully`);
        }
        else if (!isPak && !isList) {
            console.log("%s is not a pak and is not a list", convertPath);
            raiseInfo(`${convertPath} converted successfully`);
        }
    }
    
    if (lastFile) {
        if (!isPak && isList) {
            console.log("%s is not a pak and is a list", convertPath);
            raiseInfo(`${modName} ${targetExt} files converted successfully`);
        }
        else if (!isPak && !isList) {
            console.log("%s is not a pak and is not a list", convertPath);
            raiseInfo(`${convertPath} converted successfully`);
        }

        if (isPak && isList) {
            isPak = false;
            isList = true;
        }

        lastFile = false;
    }
}


module.exports = { convert };