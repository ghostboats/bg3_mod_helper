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


// this should be refactored in next release
function convert(convertPath, targetExt = path.extname(getDynamicPath(convertPath))) {
    const { excludedFiles } = getConfig();
    const normalizedExcludedFiles = excludedFiles.map(file => path.normalize(file).replace(/^([a-zA-Z]):/, (match, drive) => drive.toUpperCase() + ':'));

    console.log(`Normalized Excluded Files: ${JSON.stringify(normalizedExcludedFiles, null, 2)}`);

    const isExcluded = (file) => {
        const normalizedFile = path.normalize(file).replace(/^([a-zA-Z]):/, (match, drive) => drive.toUpperCase() + ':');
        return normalizedExcludedFiles.includes(normalizedFile);
    };

    if (targetExt === '.pak') {
        prepareTempDir();

        convert(rootModPath, '.xml');
        convert(rootModPath, '.lsx');
        processPak(rootModPath);
    } else if (Array.isArray(convertPath)) {
        for (let i = 0; i < convertPath.length; i++) {
            if (!isExcluded(convertPath[i])) {
                convert(convertPath[i], path.extname(convertPath[i]));
            } else {
                console.log(`Excluded: ${convertPath[i]}`);
            }
        }
    } else if (fs.statSync(convertPath).isDirectory()) {
        const filesToConvert = FIND_FILES(convertPath, targetExt);
        const filteredFiles = filesToConvert.filter(file => !isExcluded(file));
        console.log(`Files to convert (after exclusion): ${JSON.stringify(filteredFiles, null, 2)}`);
        convert(filteredFiles);
    } else if (fs.statSync(convertPath).isFile()) {
        if (!isExcluded(convertPath)) {
            if (isLoca(targetExt)) {
                try {
                    processLoca(convertPath, targetExt);
                } catch (Error) {
                    raiseError(Error);
                    return;
                }
            } else if (isLsf(targetExt)) {
                try {
                    processLsf(convertPath, targetExt);
                } catch (Error) {
                    raiseError(Error);
                    return;
                }
            }
        } else {
            console.log(`Excluded: ${convertPath}`);
        }
    }
}



module.exports = { convert };