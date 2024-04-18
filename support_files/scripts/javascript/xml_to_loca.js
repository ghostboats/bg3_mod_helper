const vscode = require('vscode')
const koffi = require('koffi')
const path = require('path');
const LSLIB = require('./lslib_utils')

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();
//const LSLIB = require('./lslib_utils')

function testing()
{
    console.log("help");
    console.log(divinePath);

    console.log(LSLIB);
}

function convert(outputPath, file)
{
    
}

module.exports = 
{ 
    testing, convert
};
//const lslib = require(divinePath + '/LSLIB.dll')

