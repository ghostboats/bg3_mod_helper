const path = require('path')

const { LOAD_LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');
const { LSLIB } = LOAD_LSLIB();
const ResourceUtils = LSLIB.ResourceUtils;

const { getConfig } = require('../../config.js');
const { rootModPath } = getConfig();

const { lsf, lsfx, lsx } = getFormats();


function isLsf(ext) {
    return (ext == lsf || ext == lsx);
}


function isLsfx(ext) {
    return (ext == lsfx);
}




module.exports = { isLsf, isLsfx}