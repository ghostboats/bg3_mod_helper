const vscode = require('vscode');
const util = require('util');

// const { exec } = require('child_process')
// const execAsync = util.promisify(require('child_process').exec);

const { convert } = require('../support_files/conversion_junction.js');

const { getFormats, compatRootModPath } = require('../support_files/lslib_utils.js');
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

// we should look into having a single file that exposes most commands :catyes:
module.exports = { xmlToLocaCommand, locaToXmlCommand, lsxToLsfCommand, lsfToLsxCommand };