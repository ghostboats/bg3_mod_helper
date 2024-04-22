const dotnet = require('node-api-dotnet/net8.0');

const fs = require('fs');
const path = require('path');
const koffi = require('koffi');
// const Runtime = require('System.Runtime')
// const Runtime = require('node-api-dotnet/net8.0').System.Runtime

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();

const LSLIB_DLL = '\\LSLib.dll';
const TOOL_DIR = path.join('\\Tools' + LSLIB_DLL);

// require('../../../node_modules/node-api-dotnet/net8.0.js')

var sys;
var LSLIB;
var LSLIB_PATH;
var LocaUtils;
var LocaFormat;
var in_format;
var out_format;


function LOAD_LSLIB() {
    if (fs.existsSync(path.join(divinePath + LSLIB_DLL)))
    {
        LSLIB_PATH = path.join(divinePath + LSLIB_DLL);
        console.log("LSLib.dll found at " + LSLIB_PATH + ".");
    }
    else if (fs.existsSync(path.join(divinePath + TOOL_DIR))) {
        LSLIB_PATH = path.join(divinePath + TOOL_DIR);
        console.log("LSLib.dll found at " + LSLIB_PATH + ".");
    } 
    else {
        console.error("LSLib.dll not found at " + divinePath + ".");
        LSLIB_PATH = null;
        LSLIB = null;
        return;
    }

    try {
        console.log("trying to load lslib...");
        dotnet.load(LSLIB_PATH);
        console.log ("LSLib.dll loaded from " + LSLIB_PATH + ".");
        
        // @ts-ignore
        // have to ignore these because the ts-linter doesn't know 'LSLib' exists
        LSLIB = dotnet.LSLib.LS;
        // @ts-ignore
        sys = dotnet.System.IO;

        /*
        // @ts-ignore
        LocaFormat = LSLIB.LocaFormat;
        // @ts-ignore
        LocaUtils = LSLIB.LocaUtils;

        in_format = LocaFormat.Xml;
        out_format = LocaFormat.Loca;
        

        console.log(typeof(LocaFormat) + "\n" + typeof(LocaUtils));
        console.log(typeof(in_format) + "\n" + typeof(out_format));
        */
    }
    catch (Error) {
        console.error("Error!");
        console.error(Error);
    }

    return { 
        LSLIB, LSLIB_PATH, sys
    }

}


module.exports = { LOAD_LSLIB }