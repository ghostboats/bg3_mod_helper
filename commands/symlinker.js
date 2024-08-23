const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../support_files/config');
const os = require('os');

const symlinkCommand = vscode.commands.registerCommand('bg3-mod-helper.symlinker', async function () {
    const { gameInstallLocation, rootModPath } = getConfig();

    if (!gameInstallLocation || !rootModPath) {
        vscode.window.showErrorMessage("BG3 path and mod workspace path must be set in the configuration.");
        return;
    }

    const potentialPaths = {
        Public: 'Public',
        Mods: 'Mods',
        Generated: 'Generated'
    };

    // Check if directories exist in the mod workspace
    const paths = Object.entries(potentialPaths)
        .map(([key, dir]) => ({ key, dirPath: path.join(rootModPath, dir) }))
        .filter(({ dirPath }) => fs.existsSync(dirPath))
        .reduce((acc, { key, dirPath }) => {
            acc[key] = path.join(gameInstallLocation, 'Data', key);
            return acc;
        }, {});

    // Handle localization directories
    const localizationPath = path.join(rootModPath, 'Localization');
    const locDirectories = fs.existsSync(localizationPath)
        ? fs.readdirSync(localizationPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
        : [];

    const selectedLocDirs = await vscode.window.showQuickPick(locDirectories, {
        canPickMany: true,
        placeHolder: 'Select which Localization folders to link'
    });

    if (selectedLocDirs && selectedLocDirs.length > 0) {
        selectedLocDirs.forEach(locDir => {
            paths[locDir] = path.join(gameInstallLocation, 'Data', 'Localization', locDir);
            potentialPaths[locDir] = path.join('Localization', locDir); // Correcting the source path here
        });
    }

    console.log("Paths to create symlinks for:", paths);

    let anyExists = Object.values(paths).some(p => fs.existsSync(p) && !p.includes('GustavDev'));

    if (anyExists) {
        const response = await vscode.window.showWarningMessage(
            "One or more symlink targets already exist. Choose an action:",
            'Replace All', 'Remove All', 'Cancel'
        );

        if (response === 'Cancel') {
            return;
        } else if (response === 'Remove All' || response === 'Replace All') {
            Object.values(paths).forEach(p => {
                if (fs.existsSync(p) && !p.includes('GustavDev')) {
                    console.log("Removing existing path:", p);
                    fs.rmdirSync(p, { recursive: true });
                }
            });
            if (response === 'Remove All') {
                vscode.window.showInformationMessage("All existing symlinks removed.");
                return;
            }
        }
    }

    try {
        Object.entries(paths).forEach(([key, targetPath]) => {
            const sourcePath = path.join(rootModPath, potentialPaths[key]);
            console.log("Creating symlink from", sourcePath, "to", targetPath);
            fs.symlinkSync(sourcePath, targetPath, os.platform() === 'win32' ? 'junction' : 'dir');
        });
        vscode.window.showInformationMessage("Symlinks created successfully.");
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create symlinks: ${error.message}`);
    }

    // Special handling for the GustavDev folder
    const modsPath = path.join(rootModPath, 'Mods');
    const gustavDevPath = path.join(modsPath, 'GustavDev');
    if (fs.existsSync(gustavDevPath)) {
        console.log("Ignoring GustavDev folder in Mods directory.");
    }
});

module.exports = symlinkCommand;
