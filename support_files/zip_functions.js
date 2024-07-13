const path = require('path');
const fs = require('fs');

const { isMainThread, workerData } = require('worker_threads');

const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const JSZip = require('jszip');

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

let zip = new JSZip();

async function zipUpPak(zipPak = zipOnPack) {
    if (zipPak) {
        let rootModPath = getConfig.rootModPath;

        let temp_folder = path.join(path.sep, "temp_folder");
        let lastFolderName = path.basename(rootModPath);
        
        let zipPath = path.join(rootModPath, `${lastFolderName}.pak.gz`);
        let gzip = createGzip();
        let source = fs.createReadStream(
            path.join(
                path.join(
                    path.dirname(rootModPath), temp_folder
                ), 
                lastFolderName + pak
            )
        );
        let destination = fs.createWriteStream(zipPath);
    
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


