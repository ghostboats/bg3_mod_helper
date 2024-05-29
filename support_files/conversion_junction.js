// what's your function
const path = require('path');
const os = require('os');
const fs = require('fs');

const { FIND_FILES, getFormats, compatRootModPath } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { CREATE_LOGGER, raiseError, raiseInfo } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER(); 

const { isLoca, processLoca, getLocaOutputPath } = require('./loca_convert');
const { isLsf, processLsf, getLsfOutputPath } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./process_pak');

const { isMainThread, workerData } = require('node:worker_threads');

let getConfig, getModName;

if (isMainThread) {
    getConfig = require('./config.js').getConfig();
    getModName = require('./config.js').getModName();
} else {
    getConfig = workerData.workerConfig;
    getModName = require('./lslib_utils.js').getModName();
}


function getActiveTabPath() {
    if (isMainThread) {
        const vscode = require('vscode');
        return vscode.window.activeTextEditor.document.fileName;
    } else {
        return undefined;
    }
    
}

function jobs(filesNum) {
    let halfCoreCount = Math.floor(os.availableParallelism() / 2);

    return Math.min(filesNum, halfCoreCount);
}


function buildPathArrays(filesToConvert) {
    let filesNum = filesToConvert.length;
    let jobsNum = jobs(filesNum);

    let temp_array = [];
    let fileArrays = [];

    if (jobsNum >= filesNum) {
        return filesToConvert;
    } else if (jobsNum < filesNum) {
        for (let i = 0; i < jobsNum; i++) {
            temp_array = [];
            for (let j = 0; j < filesNum; j += jobsNum) {
                let temp_index = i + j;

                if (filesToConvert[temp_index] !== undefined) {
                    // console.log(filesToConvert[temp_index]);
                    temp_array.push(filesToConvert[temp_index]);
                    // console.log(temp_array);
                }
            }
            fileArrays.push(temp_array.sort((file1, file2) => fs.statSync(file1).size - fs.statSync(file2).size));
        }
        return fileArrays;
    }
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


async function convert(convertPath, targetExt = path.extname(getDynamicPath(convertPath)), modName = getModName) {
    let rootModPath = getConfig.rootModPath;

    // console.log('targetExt:' + targetExt);
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

            processPak(rootModPath, modName);
        }
        else if (fs.statSync(convertPath).isFile()) {
            if (isMainThread) {
                processPak(convertPath, modName);
            } else {
                processPak(convertPath, modName, workerData.jobDestPath);
            }
            
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


module.exports = { convert, jobs, buildPathArrays };