const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('util');

const { LSLIB, FIND_FILES, getFormats } = require('./lslib_utils');


function processPak() {
    console.log("testing from the mod packing file catyes")
}

module.exports = { processPak }