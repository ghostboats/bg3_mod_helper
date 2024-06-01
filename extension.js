const vscode = require('vscode');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const { setConfig, getConfig, checkConfigFile, setModName, checkModDir, saveConfigFile, startUpConfig } = require('./support_files/config');

const { CREATE_LOGGER, raiseInfo } = require('./support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

let packModImport, unpackModCommand, launchGameImport, createAtlasImport, insertHandleUUIDImport, 
    openWebPageImport, createFileFromTemplateImport, goToHandleUUIDCommand, DDSToPNGCommand, PNGToDDSCommand,   addIconBackground, createModTemplateImport, getAttributesCommand, smartConvertCommand, addDependenciesCommand, xmlToLocaCommand, locaToXmlCommand, lsxToLsfCommand, lsfToLsxCommand, openConverterCommand, versionGeneratorCommand, rotationToolCommand, DDSViewerCommand, openModsFolderCommand, openGameFolderCommand, openLogsFolderCommand, openWorkspaceFolderCommand, debugCommand, unpackGameDataCommand, resizeImageTooltip, resizeImageController, resizeImageHotbar, resizeImageCustom;

const AutoCompleteProvider = require('./autocomplete/autoCompleteProvider');
const setupFunctionDescriptionHoverProvider = require('./hovers/functionDescriptions');
const setupUuidsHandlesHoverProvider = require('./hovers/uuidsHandlesCollector');

const { getFullPath } = require('./support_files/helper_functions');


function setCommands() {
    // general commands
    insertHandleUUIDImport = require('./commands/insertHandleUUID');
    goToHandleUUIDCommand = require('./commands/goToHandleUUID');
    addDependenciesCommand = require('./commands/addDependencies');
    createAtlasImport = require('./commands/createAtlas');
    openWebPageImport = require('./commands/openWebPage');
    createFileFromTemplateImport = require('./commands/createFileFromTemplate');
    createModTemplateImport = require('./commands/createModTemplate/createModTemplate');
    getAttributesCommand = require('./commands/getAttributes');
    smartConvertCommand = require('./commands/smartConvert');
    openConverterCommand = require('./commands/openConverter');
    versionGeneratorCommand = require('./commands/versionGenerator');

    // lslib commands
    xmlToLocaCommand= require('./commands/commands').xmlToLocaCommand;
    locaToXmlCommand= require('./commands/commands').locaToXmlCommand;
    lsxToLsfCommand= require('./commands/commands').lsxToLsfCommand;
    lsfToLsxCommand = require('./commands/commands').lsfToLsxCommand;
    unpackGameDataCommand = require('./commands/unpackGameData');
    packModImport = require('./commands/packMod');
    unpackModCommand = require('./commands/unpackMod');

    // folder shortcut commands
    openModsFolderCommand = require('./commands/folderShortcuts').openModsFolderCommand;
    openGameFolderCommand = require('./commands/folderShortcuts').openGameFolderCommand;
    openLogsFolderCommand = require('./commands/folderShortcuts').openLogsFolderCommand;
    openWorkspaceFolderCommand = require('./commands/folderShortcuts').openWorkspaceFolderCommand;

    // image commands
    resizeImageTooltip = require('./commands/resizeImage').resizeImageTooltip;
    resizeImageController = require('./commands/resizeImage').resizeImageController;
    resizeImageHotbar = require('./commands/resizeImage').resizeImageHotbar;
    resizeImageCustom = require('./commands/resizeImage').resizeImageCustom;
    DDSToPNGCommand = require('./commands/DDSToPNG');
    PNGToDDSCommand = require('./commands/PNGToDDS');
    addIconBackground  = require('./commands/addIconBackground');
    rotationToolCommand = require('./commands/rotationTool');
    DDSViewerCommand = require('./commands/DDSViewer');

    // launch the game
    launchGameImport = require('./commands/launchGame');

    // debug commands
    debugCommand = require('./commands/debug');
}


async function addToExcludeList(fileUri) {
    const config = vscode.workspace.getConfiguration('bg3ModHelper');
    let excludedFiles = config.get('excludedFiles') || [];

    const filePath = fileUri.fsPath.replace(/\\/g, '/');

    if (!excludedFiles.includes(filePath)) {
        excludedFiles.push(filePath);
        await config.update('excludedFiles', excludedFiles, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`${filePath} added to conversion exclusion list.`);
    } else {
        vscode.window.showWarningMessage(`${filePath} is already in the exclusion list.`);
    }
}


async function removeFromExcludeList(fileUri) {
    const config = vscode.workspace.getConfiguration('bg3ModHelper');
    let excludedFiles = config.get('excludedFiles') || [];
    const filePath = fileUri.fsPath.replace(/\\/g, '/');

    if (excludedFiles.includes(filePath)) {
        excludedFiles = excludedFiles.filter(p => p !== filePath); // Remove the file from the list
        await config.update('excludedFiles', excludedFiles, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`${filePath} removed from conversion exclusion list.`);
    } else {
        vscode.window.showWarningMessage(`${filePath} not in the exclusion list.`);
    }
}


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    bg3mh_logger.info('Displaying extension activation message');

    startUpConfig();

    setCommands();

    vscode.window.createTreeView('bg3ModHelperView', { treeDataProvider: aSimpleDataProvider() });

    // Register the command to open file at a specific line
    context.subscriptions.push(vscode.commands.registerCommand('extension.openFileAtLine', ({ relativePath, lineNum }) => {
        const fullPath = getFullPath(relativePath)

        const uri = vscode.Uri.file(fullPath);
        vscode.window.showTextDocument(uri, { preview: false }).then(editor => {
            const line = parseInt(lineNum, 10) - 1; // Convert line number to zero-based index
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        });
    }));

    // Register autocomplete provider for text files within 'Generated' folders
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', pattern: '**/Generated/**/*.txt' },
        new AutoCompleteProvider(),
        '"' // Trigger completion when `"` is typed
    ));

    let uuidsHandlesHoverProvider = setupUuidsHandlesHoverProvider();

    let functionsHoverProvider = setupFunctionDescriptionHoverProvider();

    let DDSToPNG = DDSToPNGCommand;

    let PNGToDDS = PNGToDDSCommand;

    // Register resize image commands
    let resizeTooltipCommand = vscode.commands.registerCommand('bg3-mod-helper.resizeImageTooltip', resizeImageTooltip);
    let resizeControllerCommand = vscode.commands.registerCommand('bg3-mod-helper.resizeImageController', resizeImageController);
    let resizeHotbarCommand = vscode.commands.registerCommand('bg3-mod-helper.resizeImageHotbar', resizeImageHotbar);
    let resizeCustomCommand = vscode.commands.registerCommand('bg3-mod-helper.resizeImageCustom', resizeImageCustom);

    let addIconBackgroundCommand = vscode.commands.registerCommand('extension.addIconBackground', (uri) => {
        addIconBackground(uri);
    });


    let createModTemplateCommand = vscode.commands.registerCommand('bg3-mod-helper.createModTemplate', createModTemplateImport);
    context.subscriptions.push(vscode.commands.registerCommand('bg3-mod-helper.addToExcludeList', addToExcludeList));
    context.subscriptions.push(vscode.commands.registerCommand('bg3-mod-helper.removeFromExcludeList', removeFromExcludeList));
    context.subscriptions.push(uuidsHandlesHoverProvider, functionsHoverProvider, DDSToPNG, PNGToDDS, resizeTooltipCommand, resizeControllerCommand, resizeHotbarCommand, resizeCustomCommand, createModTemplateCommand, addIconBackgroundCommand, openConverterCommand, versionGeneratorCommand, rotationToolCommand, openModsFolderCommand, openGameFolderCommand, openLogsFolderCommand, openWorkspaceFolderCommand);
}


function aSimpleDataProvider() {
    return {
        getTreeItem: (element) => {
            const treeItem = new vscode.TreeItem(element.label);
            if (element.id) {
                treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            } else {
                treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
            treeItem.command = element.command ? { command: element.command, title: "", arguments: [element.label] } : undefined;
            return treeItem;
        },
        getChildren: (element) => {
            if (!element) {
                return Promise.resolve([
                    { label: 'Pack/Unpacking Tool (Click arrow for quick actions, or text to open the tool[tool is in development])', id: 'packer' },
                    { label: 'Conversion Tool (Click arrow for quick actions, or text to open the tool)', command: 'bg3-mod-helper.openConverter', id: 'conversion' },
                    { label: 'Launch Game', command: 'bg3-mod-helper.launchGame' },
                    { label: 'Generate Folder Structure', command: 'bg3-mod-helper.createModTemplate' },
                    { label: 'Atlas Generator (Supply a folder of icons to make an atlas and its corresponding .dds with those icons, as well as its merged.lsx)', command: 'bg3-mod-helper.createAtlas' },
                    { label: 'Version Generator', command: 'bg3-mod-helper.versionGenerator' },
                    { label: 'Rotation Tool (in development)', command: 'bg3-mod-helper.rotationTool' },
                    { label: 'DDS Viewer (in development)', command: 'bg3-mod-helper.DDSViewer' },
                    { label: 'Add Dependencies to Meta via modsettings.lsx', command: 'bg3-mod-helper.addDependencies'},
                    { label: 'Debug Command', command: 'bg3-mod-helper.debugCommand' },
                    { label: 'Folder Shortcuts', id: 'folderShortcuts' }
                ]);
            } else if (element.id === 'packer') {
                return Promise.resolve([
                    { label: 'Pack Mod', command: 'bg3-mod-helper.packMod' },
                    { label: 'Unpack Mod', command: 'bg3-mod-helper.unpackMod' },
                    { label: 'Unpack Game Data', command: 'bg3-mod-helper.unpackGameDataCommand' }
                ]);
            } else if (element.id === 'conversion') {
                return Promise.resolve([
                    { label: 'Convert all XML to LOCA', command: 'bg3-mod-helper.xmlToLoca' },
                    { label: 'Convert all LOCA to XML', command: 'bg3-mod-helper.locaToXml' },
                    { label: 'Convert all LSX to LSF', command: 'bg3-mod-helper.lsxToLsf' },
                    { label: 'Convert all LSF to LSX', command: 'bg3-mod-helper.lsfToLsx' }
                ]);
            } else if (element.id === 'folderShortcuts') {
                return Promise.resolve([
                    { label: 'Mods Folder', command: 'bg3-mod-helper.openModsFolder' },
                    { label: 'Workspace Folder', command: 'bg3-mod-helper.openWorkspaceFolder' },
                    { label: 'Extension Logs Folder', command: 'bg3-mod-helper.openLogsFolder' },
                    { label: 'Game Data Folder', command: 'bg3-mod-helper.openGameFolder' },
                ]);
            } else {
                return Promise.resolve([]);
            }
        }
    };
}


function deactivate() {
    saveConfigFile();
}


module.exports = {
    activate,
    deactivate
};