const dotnet = require('node-api-dotnet');
const fs = require('fs');
const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();
const LSLIB_DLL = `\\LSLIB.dll`;
const TOOL_DIR = `\\Tools` + LSLIB_DLL;


function LOAD_LSLIB()
{
    var LSLIB_PATH;
    var LSLIB;

    if (fs.existsSync(divinePath + LSLIB_DLL))
    {
        LSLIB_PATH = divinePath + LSLIB_DLL;
    }
    else if (fs.existsSync(divinePath + TOOL_DIR))
    {
        LSLIB_PATH = divinePath + TOOL_DIR;
    }
    else
    {
        console.error("LSLib.dll not found at " + divinePath + ".")
        LSLIB = null;
        return;
    }

    if (LSLIB_PATH)
    {
        LSLIB = dotnet.load(LSLIB_PATH);
    }

}


module.exports = { LOAD_LSLIB }