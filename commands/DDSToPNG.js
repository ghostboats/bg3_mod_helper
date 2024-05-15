//https://github.com/mmomtchev/magickwand.js/blob/main/example/example.mjs
const vscode = require('vscode');
const { Magick } = require('magickwand.js');

const DDSToPNGCommand = vscode.commands.registerCommand('bg3-mod-helper.DDSToPNG', async (uri) => {
    if (!uri) {
        vscode.window.showErrorMessage('No file selected.');
        return;
    }
    
    console.log('‾‾DDSToPNGCommand‾‾');
    const filePath = uri.fsPath;
    const outputPath = filePath.replace(/\.[^/.]+$/, ".png");

    try {
        let image = new Magick.Image();
        await image.readAsync(filePath);

        const infoDDS = new Magick.CoderInfo('DDS');
        if (!infoDDS || !infoDDS.isReadable()) {
            vscode.window.showErrorMessage("DDS format is not supported for reading.");
            return;
        }

        await image.magickAsync('PNG');
        await image.writeAsync(outputPath);
        
        vscode.window.showInformationMessage(`DDS file converted successfully and saved as ${outputPath}`);
    } catch (error) {
        console.error('Error:', error);
        vscode.window.showErrorMessage('Failed to convert DDS to PNG: ' + error.message);
    }

    console.log('__DDSToPNGCommand__');
});

module.exports = DDSToPNGCommand;
