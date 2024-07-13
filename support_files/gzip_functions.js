const path = require('path');
const fs = require('fs');

const { isMainThread, workerData } = require('worker_threads');

const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);



const { pak } = require('./lslib_utils').getFormats();

const { CREATE_LOGGER } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER();


let vscode,
    getConfig;

if (isMainThread) {
    vscode = require('vscode');
    getConfig = require('./config.js').getConfig();

} else {
    getConfig = workerData.workerConfig;
}

let zipOnPack = getConfig.zipOnPack;

async function zipUpPak(zipPak = zipOnPack) {
    let rootModPath = getConfig.rootModPath;

    const temp_folder = "\\temp_folder";
    const lastFolderName = path.basename(rootModPath);
    const rootParentPath = path.dirname(rootModPath);
    const temp_path = path.join(rootParentPath, temp_folder);
    const modTempDestPath = path.join(temp_path, lastFolderName + pak);

    if (zipPak == true) {
        console.log('zipping');
        const zipPath = path.join(rootModPath, `${lastFolderName}.pak.gz`);
        const gzip = createGzip();
        const source = fs.createReadStream(modTempDestPath);
        const destination = fs.createWriteStream(zipPath);
    
        await streamPipeline(source, gzip, destination);
        bg3mh_logger.info(`Gzip file has been created at ${zipPath}`, false);
    
        if (isMainThread) {
            vscode.window.showInformationMessage(`${lastFolderName}.pak.gz created`);
        }
    } else {
        bg3mh_logger.info('not zipping');
    }
}

module.exports = { zipUpPak }


