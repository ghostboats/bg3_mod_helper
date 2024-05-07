const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { getConfig } = require('../support_files/config');

function findDivineExe(lslibPath) {
    let divinePath = null;

    function searchDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) {
                searchDir(filePath);
            } else if (file === 'Divine.exe') {
                divinePath = filePath;
                return;
            }
        }
    }

    if (fs.existsSync(lslibPath) && fs.lstatSync(lslibPath).isDirectory()) {
        searchDir(lslibPath);
    } else {
        vscode.window.showErrorMessage('lslib directory not found.');
        throw new Error('lslib directory not found.');
    }

    if (!divinePath) {
        vscode.window.showErrorMessage('No divine.exe found in lslib directory.');
        throw new Error('No divine.exe found in lslib directory.');
    }

    return divinePath;
}


let createAtlasCommand = vscode.commands.registerCommand('bg3-mod-helper.createAtlas', async function () { // Made the function async
    console.log('‾‾createAtlasCommand‾‾');
    const { rootModPath, lslibPath } = getConfig();

    const scriptPath = path.join(__dirname, '..', 'support_files', 'python_scripts', 'add_icons_to_atlas.py');
    const modsDirPath = path.join(rootModPath, 'Mods');
    let modName = '';
    let import_test = false

    let divinePath_;
    try {
        divinePath_ = findDivineExe(lslibPath);
    } catch (error) {
        console.log(error)
        return;
    }

    // Check if Mods directory exists and get the first subfolder name
    if (fs.existsSync(modsDirPath) && fs.lstatSync(modsDirPath).isDirectory()) {
        const subfolders = fs.readdirSync(modsDirPath).filter(file => fs.lstatSync(path.join(modsDirPath, file)).isDirectory());
        modName = subfolders.length > 0 ? subfolders[0] : '';
    }

    if (!modName) {
        vscode.window.showErrorMessage('Mods directory not found or no subfolders to determine mod name.');
        return;
    }

    function checkPythonImports(packages) {
        return new Promise((resolve, reject) => {
            let importCommands = packages.map(pkg => `import ${pkg}`).join(';');
            exec(`python -c "${importCommands}"`, (error, stdout, stderr) => {
                if (error) {
                    reject(`Missing package(s): ${packages.join(', ')}`);
                } else {
                    resolve();
                }
            });
        });
    }

    try {
        await checkPythonImports(['PIL', 'numpy']);
        import_test = true;
    } catch (error) {
        const terminal = vscode.window.createTerminal('Package Install');
        terminal.show();
        terminal.sendText('pip install Pillow numpy', false);
        vscode.window.showInformationMessage(`${error}. Please run the command in the opened terminal by pressing Enter.`);
        return;
    }

    if (import_test === true) {
        const newUuid = uuidv4();
        // Function to prompt user to select a directory
        async function selectDirectory() {
            const options = {
                canSelectMany: false,
                openLabel: 'Select',
                canSelectFolders: true,
                canSelectFiles: false
            };
            const fileUri = await vscode.window.showOpenDialog(options);
            if (fileUri && fileUri[0]) {
                return fileUri[0].fsPath;
            } else {
                return null;
            }
        }

        // Prompt user to select the icons directory
        const iconsDirPath = await selectDirectory();
        if (!iconsDirPath) {
            vscode.window.showErrorMessage('Icons directory not selected.');
            return;
        }

        const texturesDirPath = path.join(rootModPath, 'Public', modName, 'Assets', 'Textures', 'Icons');
        const texturesPath = path.join(texturesDirPath, `Icons_${modName}.dds`);
        const atlasDirPath = path.join(rootModPath, 'Public', modName, 'GUI');
        const atlasPath = path.join(atlasDirPath, `Icons_${modName}.lsx`);
        const mergedDirPath = path.join(rootModPath, 'Public', modName, 'Content', 'UI', '[PAK]_UI');
        const mergedPath = path.join(mergedDirPath, 'merged.lsx');
        const args = [
            '-i', `"${iconsDirPath}"`,
            '-a', `"${atlasPath}"`,
            '-t', `"${texturesPath}"`,
            '-u', `"${newUuid}"`,
            '--divine', `"${divinePath_}"`
        ].join(' ');

        // Before writing the modified content to the new merged.lsx file
        if (!fs.existsSync(mergedDirPath)) {
            fs.mkdirSync(mergedDirPath, { recursive: true });
        }

        const command = `python "${scriptPath}" ${args}`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                vscode.window.showErrorMessage(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            vscode.window.showInformationMessage('Python script executed successfully.');
        });
        console.log('#################################')
        // Check if merged.lsx exists
        if (fs.existsSync(mergedPath)) {
            const overwrite = await vscode.window.showInformationMessage('A merged.lsx file already exists. Do you want to overwrite it?', 'Yes', 'No');
            if (overwrite === 'No') {
                return; // Stop execution if user chooses not to overwrite
            }
        }

        // Use a skeleton merged.lsx file as a template
        const skeletonMergedPath = path.join(__dirname, '../support_files/templates/long_skeleton_files/merged_atlas.lsx');
        let mergedContent = fs.readFileSync(skeletonMergedPath, 'utf8');

        // Replace placeholders in merged.lsx file
        mergedContent = mergedContent.replace(/\{uuid\}/g, newUuid);
        mergedContent = mergedContent.replace(/\{file_name\}/g, `Icons_${modName}`);
        mergedContent = mergedContent.replace(/\{file_path\}/g, `Public/${modName}/Assets/Textures/Icons/Icons_${modName}.dds`);

        // Write the modified content to the new merged.lsx file
        fs.writeFileSync(mergedPath, mergedContent, 'utf8');
        vscode.window.showInformationMessage(`merged.lsx file created/updated successfully at ${mergedDirPath}`);

    } else {
        console.log('Pil not found, not running exe for atlas icon stuff')
    }
    console.log('__createAtlasCommand__');
});

module.exports = createAtlasCommand;
