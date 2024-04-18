const koffi = require('koffi')
const path = require('path');

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig()

function testing()
{
    console.log("help");
    console.log(divinePath)
}

module.exports = { testing }
//const lslib = require(divinePath + '/LSLIB.dll')

