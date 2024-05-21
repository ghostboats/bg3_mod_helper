const path = require('path');
const vscode = require('vscode');
const fs = require('fs');

const { LSLIB, getFormats, moveFileAcrossDevices, compatRootModPath } = require('./lslib_utils');
const { pak } = getFormats();

const { CREATE_LOGGER, raiseError, raiseInfo } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

const { getConfig } = require('./config.js');

const temp_folder = "\\temp_folder";
const temp_path = path.join(rootParentPath, temp_folder);



function prepareTempDir(movedPak = false) {
    const { rootModPath } = getConfig();
    const rootParentPath = path.dirname(rootModPath);

    const temp_path = path.join(rootParentPath, temp_folder);
    console.log('test11')
    console.log(rootParentPath)
    console.log(rootModPath)
    if (!(fs.existsSync(temp_path))) {
        console.log("making temp_path");
        // fs.mkdirSync(temp_path, { recursive: true});
        return;
    }
    // this is being finicky :starege:
    /*
    else if (movedPak) {
        console.log("deleting temp_path %s", modTempDestPath);
        console.log(fs.existsSync(modTempDestPath))
        fs.unlinkSync(modTempDestPath);
        fs.rmSync(temp_path, { recursive: true, force: true });
  
        return;
    }
    */
}


// btw, sometimes this will log things before others because it's async.
async function processPak(modPath, modName_) {
    console.log('check')
    const { rootModPath, modDestPath } = getConfig();
    var build = new LSLIB.PackageBuildData();
    var Packager = new LSLIB.Packager();
    const lastFolderName = path.basename(rootModPath);
    const rootParentPath = path.dirname(rootModPath);
    const temp_path = path.join(rootParentPath, temp_folder);

    const modFinalDestPath = path.join(modDestPath, lastFolderName + pak);
    const modTempDestPath = path.join(temp_path, lastFolderName + pak);

    const metaPath = path.join(rootModPath, 'Mods', modName_, 'meta.lsx');
    

    try {
        // Read the XML content
        let xmlContent = fs.readFileSync(metaPath, 'utf8');

        // Modify the Name attribute in the XML
        xmlContent = xmlContent.replace(/(<attribute id="Name" type="FixedString" value=")(.*?)("\/>)/, `$1${lastFolderName}$3`);

        // Write the updated XML back to the file
        fs.writeFileSync(metaPath, xmlContent, 'utf8');
        bg3mh_logger.info('meta.lsx updated successfully.');
        await Packager.CreatePackage(modTempDestPath, modPath, build);

        raiseInfo(lastFolderName + pak + " packed", false);
        vscode.window.showInformationMessage(`${lastFolderName + pak} packed`);

        // move files to chosen path and [in progress] clean up the empty directory
        moveFileAcrossDevices(modTempDestPath, modFinalDestPath);
        prepareTempDir(true);
    }
    catch (Error) {
        raiseError(Error);
    }
}


module.exports = { processPak, prepareTempDir };