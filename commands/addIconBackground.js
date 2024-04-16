const vscode = require('vscode');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises; // Use promises version of fs for async/await compatibility

async function addIconBackground(uri) {
    const inputPath = uri.fsPath;
    const backgroundsDir = path.join(__dirname, '../support_files/templates/icon_backgrounds');

    try {
        const files = await fs.readdir(backgroundsDir);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        // Ensure each option has an isCustom property for consistent handling
        const backgroundOptions = pngFiles.map(file => ({ label: file, isCustom: false }));
        backgroundOptions.push({ label: 'Custom Background...', isCustom: true });

        // Prompt user for background selection
        const selectedBackground = await vscode.window.showQuickPick(backgroundOptions, { placeHolder: 'Select a background' });
        if (!selectedBackground) return;

        let backgroundPath;
        if (selectedBackground.isCustom) {
            // Handle custom background selection
            const customUri = await vscode.window.showOpenDialog({
                openLabel: 'Use Background',
                canSelectMany: false,
                filters: { 'Images': ['png'] }
            });
            if (customUri && customUri[0]) {
                backgroundPath = customUri[0].fsPath;
            } else {
                return; // No file selected, exit the function
            }
        } else {
            // Use selected predefined background
            backgroundPath = path.join(backgroundsDir, selectedBackground.label);
        }

        const outputPath = inputPath.replace(/\.\w+$/, `_with_background.png`);

        // Load both images to compare sizes
        const iconImage = sharp(inputPath);
        const background = sharp(backgroundPath);
        const [iconMetadata, backgroundMetadata] = await Promise.all([iconImage.metadata(), background.metadata()]);

        if (iconMetadata.width !== backgroundMetadata.width || iconMetadata.height !== backgroundMetadata.height) {
            const resizeBackground = await vscode.window.showInformationMessage(
                'The background and icon sizes do not match. Resize the background to match the icon?',
                'Yes', 'No'
            );
            if (resizeBackground === 'Yes') {
                await background.resize(iconMetadata.width, iconMetadata.height);
            } else {
                return;
            }
        }

        // Composite the icon over the resized background
        background
            .composite([{ input: await iconImage.toBuffer(), gravity: 'centre' }])
            .toFile(outputPath)
            .then(() => {
                vscode.window.showInformationMessage(`Background added: ${outputPath}`);
            })
            .catch(err => {
                vscode.window.showErrorMessage(`Error adding background: ${err}`);
            });
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to read backgrounds directory or process images: ${err}`);
    }
}

module.exports = addIconBackground;
