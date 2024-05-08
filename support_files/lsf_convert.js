const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

const { LSLIB, getFormats, baseNamePath } = require('./lslib_utils');
const ResourceConversionParameters = LSLIB.ResourceConversionParameters;
const ResourceLoadParameters = LSLIB.ResourceLoadParameters;
const Game = LSLIB.Enums.Game;

const { lsb, lsf, lsj, lsfx, lsbc, lsbs, lsx } = getFormats();
const lsfFormats = [lsb, lsf, lsj, lsfx, lsbc, lsbs, lsx];

const { CREATE_LOGGER, raiseError } = require('./log_utils');
var bg3mh_logger = CREATE_LOGGER();

var to_lsf;


function isLsf(ext) {
    return lsfFormats.includes(ext);
}


function checkForLsb(tempPath) {
    var lsbDir = fs.existsSync(tempPath + lsb);
    return lsbDir;
}


function checkForLsj(tempPath) {
    var lsjDir = fs.existsSync(tempPath + lsj);
    return lsjDir;
}


function checkForLsfx(tempPath) {
    var lsfxDir = fs.existsSync(tempPath + lsfx);
    return lsfxDir;
}


function checkForLsbc(tempPath) {
    var lsbcDir = fs.existsSync(tempPath + lsbc);
    return lsbcDir;
}


function checkForLsbs(tempPath) {
    var lsbsDir = fs.existsSync(tempPath + lsbs);
    return lsbsDir;
}


function getLsfOutputPath(filePath) {
    to_lsf = "";
    var source_ext = path.extname(filePath);
    var temp = baseNamePath(filePath, source_ext);

    if (source_ext == lsx) {
        if (checkForLsb(temp)) {
            to_lsf = lsb;
        }
        else if (checkForLsj(temp)) {
            to_lsf = lsj;
        }
        else if (checkForLsfx(temp)) {
            to_lsf = lsfx;
        }
        else if (checkForLsbc(temp)) {
            to_lsf = lsbc;
        }
        else if (checkForLsbs(temp)) {
            to_lsf = lsbs;
        }
        else {
            to_lsf = lsf;
        }
    }
    else if (lsfFormats.includes(source_ext) && source_ext != lsx) {
        to_lsf = lsx;
    }

    temp = path.normalize(temp + to_lsf);
    return temp;
}


function processLsf(file, targetExt) {
    var load_params = ResourceLoadParameters.FromGameVersion(Game.BaldursGate3);
    var conversion_params = ResourceConversionParameters.FromGameVersion(Game.BaldursGate3);
    var ResourceUtils = LSLIB.ResourceUtils;

    var file_output = "";
    var temp_lsf = "";
        file_output = getLsfOutputPath(file);
        bg3mh_logger.info("Converting %s file %s to format %s", targetExt, file, to_lsf);

    try {
        temp_lsf = ResourceUtils.LoadResource(file, load_params);
        ResourceUtils.SaveResource(temp_lsf, file_output, conversion_params);

        bg3mh_logger.info("Exported %s file: %s", to_lsf, file_output);
    }
    catch (Error) { 
        raiseError(Error);
    }
}
 

module.exports = { isLsf, processLsf, getLsfOutputPath, to_lsf };