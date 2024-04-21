const vscode = require('vscode');
const fs = require('fs');

// const { LOAD_LSLIB } = require('./lslib_utils');
// const { LSLIB } = LOAD_LSLIB();
// const LocaUtils = lslib.LS.LocaUtils;
// const LocaFormat = lslib.LS.LocaFormat;

// const path = require('path');

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();

function testing()
{
    console.log("help i'm stuck in xml_to_loca.js");
    console.log(divinePath);

    // console.log(lslib + "\n" + LocaUtils + "\n" + LocaFormat);

}

function convert(outputPath, file)
{
    
}

module.exports = 
{ 
    testing, convert
};

