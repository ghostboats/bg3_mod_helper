const fs = require('fs');
const path = require('path');

const { LOAD_LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { LSLIB } = LOAD_LSLIB();
const ResourceUtils = LSLIB.ResourceUtils;
const ResourceConversionParameters = LSLIB.ResourceConversionParameters;
const ResourceLoadParameters = LSLIB.ResourceLoadParameters;
const Game = LSLIB.Enums.Game;
const ResourceFormat = LSLIB.Enums.ResourceFormat;


const { getConfig } = require('../../config.js');
const { rootModPath } = getConfig();

const { lsf, lsfx, lsbc, lsbs, lsx } = getFormats();
const lsfFormats = [lsf, lsfx, lsbc, lsbs, lsx]

var to_lsf;


function isLsf(ext) {
    return lsfFormats.includes(ext);
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
    var source_ext = path.extname(filePath);
    var temp = filePath.substring(0, (filePath.length - source_ext.length));
    
    if (source_ext == lsf) {
        to_lsf = lsx;
    }
    else if (source_ext == lsx) {
        if (checkForLsfx(temp)) {
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
    else if (source_ext == lsfx || source_ext == lsbc || source_ext == lsbs) {
        to_lsf = lsx;
    }

    temp = path.normalize(temp + to_lsf);
    return temp;
}


function processLsf(file, targetExt) {

}
 

module.exports = { isLsf, getLsfOutputPath }