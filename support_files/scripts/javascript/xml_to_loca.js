const vscode = require('vscode')

const { LOAD_LSLIB } = require('./lslib_utils').LOAD_LSLIB
const lslib = new LOAD_LSLIB;
const LocaUtils = lslib.LS.LocaUtils;
const LocaFormat = lslib.LS.LocaFormat;

const path = require('path');

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();
//const LSLIB = require('./lslib_utils')

function testing()
{
    console.log("help");
    console.log(divinePath);

    console.log(lslib);

    console.log(lslib + "\n" + LocaUtils + "\n" + LocaFormat);

}

function convert(outputPath, file)
{
    
}

module.exports = 
{ 
    testing, convert
};
//const lslib = require(divinePath + '/LSLIB.dll')

