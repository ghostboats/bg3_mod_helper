const vscode = require('vscode');
const util = require('util');

// const { exec } = require('child_process')
// const execAsync = util.promisify(require('child_process').exec);

const { convert, compatRootModPath} = require('../support_files/scripts/javascript/conversion_junction.js');

const { getFormats } = require('../support_files/scripts/javascript/lslib_utils.js');
const { loca, xml, lsf, lsx } = getFormats();


const xmlToLocaCommand = vscode.commands.registerCommand('bg3-mod-helper.xmlToLoca', async function () {
    convert(compatRootModPath, xml);
});


const locaToXmlCommand = vscode.commands.registerCommand('bg3-mod-helper.locaToXml', async function () {
    convert(compatRootModPath, loca);
});


const lsxToLsfCommand = vscode.commands.registerCommand('bg3-mod-helper.lsxToLsf', async function () { 
    convert(compatRootModPath, lsx);
});


const lsfToLsxCommand = vscode.commands.registerCommand('bg3-mod-helper.lsfToLsx', async function () { 
    convert(compatRootModPath, lsf);
});


module.exports = { xmlToLocaCommand, locaToXmlCommand, lsxToLsfCommand, lsfToLsxCommand };