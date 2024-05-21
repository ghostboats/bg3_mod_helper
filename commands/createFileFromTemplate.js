const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const { insertText, getModName } = require('../support_files/helper_functions');
const { getConfig } = require('../support_files/config');
const templates = require('../support_files/templates/skeleton_files');

const locales = [
    "BrazilianPortuguese",
    "Chinese",
    "ChineseTraditional",
    "English",
    "French",
    "German",
    "Italian",
    "Japanese",
    "Korean",
    "LatinSpanish",
    "Polish",
    "Russian",
    "Spanish",
    "Turkish",
    "Ukrainian",
]

let createFileFromTemplateCommand = vscode.commands.registerCommand('bg3-mod-helper.createFileFromTemplate', async () => {
    const templateNames = Object.keys(templates);
    const selectedTemplateName = await vscode.window.showQuickPick(templateNames, {
        placeHolder: 'Type to filter templates...',
        matchOnDetail: true
    });

    if (!selectedTemplateName) {
        return;
    }

    const templatePath = templates[selectedTemplateName];
    const fullPath = path.join(__dirname, templatePath);
    console.log(`Full path to template: ${fullPath}`);

    let fileContent;
    if (templatePath.endsWith('.lsx')) {
        // Read file content if it's a .lsx file
        fileContent = fs.readFileSync(path.join(__dirname, templatePath), 'utf8');
    } else {
        // Handle other templates as before
        fileContent = templates[selectedTemplateName];
    }

    let fileName = selectedTemplateName;
    if (selectedTemplateName === 'Localization loca.xml') {
        const { fileName: localeFileName, fileContent: localeFileContent, selectedLocale } = await handleLocalizationTemplate(fileContent);
        if (!localeFileName) {
            return;
        }
        fileName = localeFileName;
        fileContent = localeFileContent;
        await createFileInWorkspace(fileName, fileContent, selectedLocale);
    } else {
        await createFileInWorkspace(selectedTemplateName, fileContent);
    }
});

async function handleLocalizationTemplate(fileContent) {
    const selectedLocale = await vscode.window.showQuickPick(locales, {
        placeHolder: 'Select a locale for the .loca.xml file'
    });

    if (!selectedLocale) {
        vscode.window.showInformationMessage('No locale selected. Operation cancelled.');
        return { fileName: null, fileContent: null, selectedLocale: null };
    }

    const modName = await getModName();
    const fileName = `${modName}_${selectedLocale}.loca.xml`;
    return { fileName, fileContent, selectedLocale };
}

async function createFileInWorkspace(fileName, fileContent, locale = '') {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }

    const config = getConfig();
    const rootModPath = config.rootModPath;
    let fileOutdir = rootModPath;
    if (locale) {
        const localizationPath = path.join(rootModPath, 'Localization', locale);

        // Ensure the Localization folder exists
        if (!fs.existsSync(localizationPath)) {
            fs.mkdirSync(localizationPath, { recursive: true });
        }
        fileOutdir = localizationPath;
    }

    const filePath = path.join(fileOutdir, fileName);
    const fileUri = vscode.Uri.file(filePath);

    if (fs.existsSync(filePath)) {
        vscode.window.showInformationMessage(`${fileName} already exists at ${filePath} and will not be overwritten.`);
        return;
    }

    try {
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent));
        vscode.window.showInformationMessage(`${fileName} created successfully at ${filePath}.`);
        vscode.window.showTextDocument(fileUri);
    } catch (err) {
        vscode.window.showErrorMessage(`Error creating ${fileName}: ${err}`);
    }
}

let insertAttributeCommand = vscode.commands.registerCommand('bg3-mod-helper.insertAttribute', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const text = editor.document.getText();
    const attributeLines = extractAttributeLines(text, '<!--press control shift a to quick spawn a line below', 'end custom attribute lines-->');
    if (attributeLines.length === 0) {
        vscode.window.showInformationMessage('No custom attributes found.');
        return;
    }

    vscode.window.showQuickPick(attributeLines).then(selectedLine => {
        if (selectedLine) {
        insertText(selectedLine);
        }
    });
});

let insertClipboardCommand = vscode.commands.registerCommand('bg3-mod-helper.insertClipboard', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const text = editor.document.getText();
    const clipboardLines = extractAttributeLines(text, '<!--press control shift 2 to quick spawn a line below', 'end ctrl shift 2 clipboard-->');
    if (clipboardLines.length === 0) {
        vscode.window.showInformationMessage('No clipboard content found.');
        return;
    }

    vscode.window.showQuickPick(clipboardLines).then(selectedLine => {
        if (selectedLine) {
            insertText(selectedLine);
        }
    });
});

function extractAttributeLines(text, startDelimiter, endDelimiter) {
    const lines = text.split('\n');
    const start = lines.findIndex(line => line.includes(startDelimiter));
    const end = lines.findIndex(line => line.includes(endDelimiter), start);
    if (start === -1 || end === -1 || start >= end) return [];
    return lines.slice(start + 1, end);
}
