const path = require('path');
const fs = require('fs');
const { isMainThread, workerData } = require('worker_threads');
const JSZip = require('jszip');
const { promisify } = require('util');
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

let zip = new JSZip();

async function zipUpPak(zipPak) {
    let rootModPath = getConfig.rootModPath;
    let modDestPath = getConfig.modDestPath;
    let lastFolderName = path.basename(rootModPath);
    let zipPath = path.join(modDestPath, `${lastFolderName}.zip`);

    let temp_folder = path.join(path.sep, "temp_folder");
    let pakFilePath = path.join(path.join(path.dirname(rootModPath), temp_folder), lastFolderName + pak);

    if (fs.existsSync(pakFilePath)) {
        let data = await promisify(fs.readFile)(pakFilePath);

        zip.file(`${lastFolderName}.pak`, data);

        let content = await zip.generateAsync({ type: 'nodebuffer' });
        await promisify(fs.writeFile)(zipPath, content);

        bg3mh_logger.info(`Zip file has been created at ${zipPath}`, false);

        await promisify(fs.unlink)(pakFilePath);
        bg3mh_logger.info(`Original .pak file has been deleted at ${pakFilePath}`, false);

        if (isMainThread) {
            vscode.window.showInformationMessage(`${lastFolderName}.zip created`);
        }
    } else {
        bg3mh_logger.error(`.pak file not found at ${pakFilePath}`);
        if (isMainThread) {
            vscode.window.showErrorMessage(`.pak file not found at ${pakFilePath}`);
        }
    }
}

module.exports = { zipUpPak };
