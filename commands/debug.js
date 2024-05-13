const vscode = require('vscode');

const { FILTER_PATHS, FIND_FILES, getFormats } = require('../support_files/lslib_utils');
const { xml, lsx } = getFormats();

const { rootModPath } = require('../support_files/config.js').getConfig();

const { CREATE_LOGGER, raiseInfo } = require('../support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

var test_paths;

let debugCommand = vscode.commands.registerCommand('bg3-mod-helper.debugCommand', async function () { // Made the function async
    console.log('‾‾debugCommand‾‾');
    vscode.window.showWarningMessage(
        'cmon dude i said no :('
    )

    test_paths = FIND_FILES(rootModPath, lsx);
    raiseInfo(test_paths, false);

    console.log('__debugCommand__');
});

module.exports = debugCommand;
