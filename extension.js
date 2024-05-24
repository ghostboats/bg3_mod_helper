const vscode = require('vscode');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const { setConfig, getConfig } = require('./support_files/config');

const packModImport = require('./commands/packMod');
const unpackModCommand = require('./commands/unpackMod');
const launchGameImport = require('./commands/launchGame');
const createAtlasImport = require('./commands/createAtlas');
const insertHandleUUIDImport = require('./commands/insertHandleUUID');
const openWebPageImport = require('./commands/openWebPage');
const createFileFromTemplateImport = require('./commands/createFileFromTemplate');
const goToHandleUUIDCommand = require('./commands/goToHandleUUID');
const DDSToPNGCommand = require('./commands/DDSToPNG');
const PNGToDDSCommand = require('./commands/PNGToDDS');
const addIconBackground  = require('./commands/addIconBackground');
const createModTemplateImport = require('./commands/createModTemplate/createModTemplate');
const getAttributesCommand = require('./commands/getAttributes');
const smartConvertCommand = require('./commands/smartConvert');
const { xmlToLocaCommand, locaToXmlCommand, lsxToLsfCommand, lsfToLsxCommand } = require('./commands/commands')

const openConverterCommand = require('./commands/openConverter');
const versionGeneratorCommand = require('./commands/versionGenerator');
const rotationToolCommand = require('./commands/rotationTool');
const DDSViewerCommand = require('./commands/DDSViewer');

const { openModsFolderCommand, openGameFolderCommand, openLogsFolderCommand, openWorkspaceFolderCommand } = require('./commands/folderShortcuts');


const AutoCompleteProvider = require('./autocomplete/autoCompleteProvider');

const { CREATE_LOGGER } = require('./support_files/log_utils');
var bg3mh_logger = CREATE_LOGGER();

const debugCommand = require('./commands/debug');
const debug2Command = require('./commands/debug2');
const setupFunctionDescriptionHoverProvider = require('./hovers/functionDescriptions');
const setupUuidsHandlesHoverProvider = require('./hovers/uuidsHandlesCollector');
const { resizeImageTooltip, resizeImageController, resizeImageHotbar, resizeImageCustom } = require('./commands/resizeImage');

const { getFullPath } = require('./support_files/helper_functions');


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

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        const mainFolderPath = workspaceFolders[0].uri.fsPath;

        // Update the extension configuration
        const config = vscode.workspace.getConfiguration('bg3ModHelper');
        config.update('rootModPath', mainFolderPath, vscode.ConfigurationTarget.Workspace
            ).then(() => {
                vscode.window.showInformationMessage(`Workspace set to:
                ${mainFolderPath}.`,
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'bg3ModHelper');
                }
            });
            }, (error) => {
                vscode.window.showErrorMessage(`Error setting workspace: ${error}`);
            });
    }

    let config = vscode.workspace.getConfiguration('bg3ModHelper');

    setConfig({
        maxFilesToShow: config.get('hover.maxFiles'),
        hoverEnabled: config.get('hover.enabled'),
        maxCacheSize: config.get('maxCacheSize'),
        rootModPath: config.get('rootModPath'),
        modDestPath: config.get('modDestPath'),
        lslibPath: config.get('lslibPath'),
        autoLaunchOnPack: config.get('autoLaunchOnPack'),
        launchContinueGame: config.get('launchContinueGame'),
        addHandlesToAllLocas: config.get('addHandlesToAllLocas'),
        excludedFiles: config.get('excludedFiles') || [],
        gameInstallLocation: config.get('gameInstallLocation')
    });
    bg3mh_logger.info('Initial configs set:' + JSON.stringify(config, null, 2))
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage(
            'bg3-mod-helper extension requires a workspace to be set for optimal functionality, one not found.'
        )
    }

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
                    { label: 'Pack/Unpacking Tool (Click arrow for quick actions, or text to open the tool)', command: 'bg3-mod-helper.openPacker', id: 'packer' },
                    { label: 'Conversion Tool (Click arrow for quick actions, or text to open the tool)', command: 'bg3-mod-helper.openConverter', id: 'conversion' },
                    { label: 'Launch Game', command: 'bg3-mod-helper.launchGame' },
                    { label: 'Generate Folder Structure', command: 'bg3-mod-helper.createModTemplate' },
                    { label: 'Atlas Generator (Supply a folder of icons to make an atlas and its corresponding .dds with those icons, as well as its merged.lsx)', command: 'bg3-mod-helper.createAtlas' },
                    { label: 'Version Generator', command: 'bg3-mod-helper.versionGenerator' },
                    { label: 'Rotation Tool (in development)', command: 'bg3-mod-helper.rotationTool' },
                    { label: 'DDS Viewer (in development)', command: 'bg3-mod-helper.DDSViewer' },
                    { label: 'Debug Command', command: 'bg3-mod-helper.debugCommand' },
                    { label: 'Debug2 Command', command: 'bg3-mod-helper.debug2Command' },
                    { label: 'Folder Shortcuts', command: 'bg3-mod-helper.folderShortcuts', id: 'folderShortcuts' }
                ]);
            } else if (element.id === 'packer') {
                return Promise.resolve([
                    { label: 'Pack Mod', command: 'bg3-mod-helper.packMod' },
                    { label: 'Unpack Mod (in development)', command: 'bg3-mod-helper.unpackMod' }
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


function deactivate() {}


module.exports = {
    activate,
    deactivate
};