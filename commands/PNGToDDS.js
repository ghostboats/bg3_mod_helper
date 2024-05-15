//https://github.com/mmomtchev/magickwand.js/blob/main/example/example.mjs
const vscode = require('vscode');
const { Magick } = require('magickwand.js');

const PNGToDDSCommand = vscode.commands.registerCommand('bg3-mod-helper.PNGToDDS', async (uri) => {
    if (!uri) {
        vscode.window.showErrorMessage('No file selected.');
        return;
    }

    const filePath = uri.fsPath;
    const normalizedFilePath = filePath.toLowerCase().replace(/\\/g, '/');

    const ddsCompression = normalizedFilePath.includes('assets/textures/icons') ? 'DXT5' : 'DXT1';
    const outputExtension = normalizedFilePath.includes('assets/textures') ? '.dds' : '.DDS';
    const outputPath = filePath.replace(/\.[^/.]+$/, outputExtension);

    try {
        let image = new Magick.Image();
        await image.readAsync(filePath);

        await image.magickAsync('DDS');

        await image.writeAsync(outputPath);

        vscode.window.showInformationMessage(`File converted successfully and saved as ${outputPath}`);
    } catch (error) {
        console.error('Error:', error);
        vscode.window.showErrorMessage('Failed to convert image: ' + error.message);
    }
});

module.exports = PNGToDDSCommand;
