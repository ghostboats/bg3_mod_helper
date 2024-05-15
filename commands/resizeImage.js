const vscode = require('vscode');
const { Magick } = require('magickwand.js');

async function resizeImage(uri, width = null, height = null) {
    console.log('‾‾resizeImage‾‾');
    const inputPath = uri.fsPath;

    if (!width || !height) {
        width = await vscode.window.showInputBox({
            prompt: 'Enter the width in pixels',
            validateInput: (text) => text.match(/^\d+$/) ? null : 'Please enter a valid number'
        });
        if (!width) return;

        height = await vscode.window.showInputBox({
            prompt: 'Enter the height in pixels',
            validateInput: (text) => text.match(/^\d+$/) ? null : 'Please enter a valid number'
        });
        if (!height) return;

        width = parseInt(width);
        height = parseInt(height);
    }

    const outputPath = inputPath.replace(/\.\w+$/, `_resized_${width}x${height}.png`);

    try {
        let image = new Magick.Image();
        await image.readAsync(inputPath);
        await image.scaleAsync(`${width}x${height}`);
        await image.writeAsync(outputPath);
        vscode.window.showInformationMessage(`Image resized to ${width}x${height}: ${outputPath}`);
    } catch (err) {
        vscode.window.showErrorMessage(`Error resizing image: ${err}`);
    }
    console.log('__resizeImage__');
}

module.exports = {
    resizeImageTooltip: (uri) => resizeImage(uri, 380, 380),
    resizeImageController: (uri) => resizeImage(uri, 144, 144),
    resizeImageHotbar: (uri) => resizeImage(uri, 64, 64),
    resizeImageCustom: resizeImage
};
