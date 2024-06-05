const fs = require('fs');
const path = require('path');

const { isMainThread, workerData } = require('worker_threads');

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


function xmlUpdate(){
    // Read the XML content
    let rootModPath = getConfig.rootModPath;
    const lastFolderName = path.basename(rootModPath);
    const metaPath = path.join(rootModPath, 'Mods', getConfig.modName, 'meta.lsx');
    let xmlContent = fs.readFileSync(metaPath, 'utf8');
    
    // Modify the Name attribute in the XML
    xmlContent = xmlContent.replace(/(<attribute id="Name" type="FixedString" value=")(.*?)("\/>)/, `$1${lastFolderName}$3`);

    // Write the updated XML back to the file
    fs.writeFileSync(metaPath, xmlContent, 'utf8');
    bg3mh_logger.info('meta.lsx updated successfully.');
}


module.exports = { xmlUpdate };