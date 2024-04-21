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

var LSLIB;
var LSLIB_PATH;
var LocaUtils;
var LocaFormat;


function LOAD_LSLIB()
{
    /*if (fs.existsSync(path.join(divinePath + LSLIB_DLL)))
    {
        LSLIB_PATH = path.join(divinePath + LSLIB_DLL);
        console.log("LSLib.dll found at " + LSLIB_PATH + ".");
    } */
    if (fs.existsSync(path.join(divinePath + TOOL_DIR)))
    {
        LSLIB_PATH = path.join(divinePath + TOOL_DIR);
        console.log("LSLib.dll found at " + LSLIB_PATH + ".");
    }
    else
    {
        console.error("LSLib.dll not found at " + divinePath + ".");
        LSLIB_PATH = null;
        LSLIB = null;
        return;
    }

    try 
    {
        console.log("trying to load lslib...");
        dotnet.load(LSLIB_PATH);
        console.log ("LSLib.dll loaded from " + LSLIB_PATH + ".");

        // LSLIB = "beep";
        
        LocaFormat = dotnet.LSLib.LS.LocaFormat;
        LocaUtils = dotnet.LSLib.LS.LocaUtils;

        console.log(typeof(LocaFormat) + "\n" + typeof(LocaFormat));
        console.log ("LSLib.dll loaded from " + LSLIB_PATH + ".");
    }
    catch (Error) 
    {
        console.error("Error!");
        console.error(Error);
    }

    return { LSLIB, LSLIB_PATH }

}


module.exports = { LOAD_LSLIB }