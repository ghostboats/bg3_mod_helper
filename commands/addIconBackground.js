const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const { Magick, MagickCore } = require('magickwand.js');

async function addIconBackground(uri) {
    const inputPath = uri.fsPath;
    const backgroundsDir = path.join(__dirname, '../support_files/templates/icon_backgrounds');

    try {
        const files = await fs.readdir(backgroundsDir);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        const backgroundOptions = pngFiles.map(file => ({ label: file, isCustom: false }));
        backgroundOptions.push({ label: 'Custom Background...', isCustom: true });

        const selectedBackground = await vscode.window.showQuickPick(backgroundOptions, { placeHolder: 'Select a background' });
        if (!selectedBackground) return;

        let backgroundPath;
        if (selectedBackground.isCustom) {
            const customUri = await vscode.window.showOpenDialog({
                openLabel: 'Use Background',
                canSelectMany: false,
                filters: { 'Images': ['png'] }
            });
            if (customUri && customUri[0]) {
                backgroundPath = customUri[0].fsPath;
            } else {
                return;
            }
        } else {
            backgroundPath = path.join(backgroundsDir, selectedBackground.label);
        }

        const outputPath = inputPath.replace(/\.\w+$/, `_with_background.png`);

        const iconImage = new Magick.Image;
        await iconImage.readAsync(inputPath);
        const background = new Magick.Image;
        await background.readAsync(backgroundPath);

        const iconSize = await iconImage.sizeAsync();
        const backgroundSize = await background.sizeAsync();
        const iconWidth = iconSize.width();
        const iconHeight = iconSize.height();
        let backgroundWidth = backgroundSize.width();
        let backgroundHeight = backgroundSize.height();

        if (iconWidth !== backgroundWidth || iconHeight !== backgroundHeight) {
            const resizeBackground = await vscode.window.showInformationMessage(
                'The background and icon sizes do not match. Resize the background to match the icon?',
                'Yes', 'No'
            );
            if (resizeBackground === 'Yes') {
                await background.resizeAsync(`${iconWidth}x${iconHeight}`);
                const backgroundSizeResize = await background.sizeAsync();
                backgroundWidth = backgroundSizeResize.width();
                backgroundHeight = backgroundSizeResize.height();
            } else {
                return;
            }
        }

        const xOffset = Math.floor((backgroundWidth - iconWidth) / 2);
        const yOffset = Math.floor((backgroundHeight - iconHeight) / 2);

        console.log(`Calculated xOffset: ${xOffset}, yOffset: ${yOffset}`);

        // Create a Geometry object for the composite operation
        const geometry = new Magick.Geometry(iconWidth, iconHeight, xOffset, yOffset);
        console.log('Attempting to composite with geometry:', geometry.toString());
        await background.compositeAsync(iconImage, geometry, MagickCore.OverCompositeOp);

        await background.writeAsync(outputPath);
        vscode.window.showInformationMessage(`Background added: ${outputPath}`);
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to read backgrounds directory or process images: ${err}`);
    }
}

module.exports = addIconBackground;
