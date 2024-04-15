// DDSToPNG.js
const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');

const DDSToPNGCommand = vscode.commands.registerCommand('bg3-mod-helper.DDSToPNG', async (uri) => {
    console.log('‾‾DDSToPNGCommand‾‾');
    const checkWandScriptPath = path.join(__dirname, '..', 'support_files', 'python_scripts', 'check_wand.py');
    const scriptPath = path.join(__dirname, '..', 'support_files', 'python_scripts', 'DDS_to_PNG.py');
    const filePath = uri.fsPath;

    // Check if Wand is installed
    exec(`python "${checkWandScriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error:', error);
            return;
        }
        if (stderr) {
            console.error('Script error:', stderr);
            return;
        }
        if (stdout.trim() === "Wand not installed") {
            vscode.window.showInformationMessage(
                "Wand Python package is not installed. Open terminal to install wand? ENSURE PIP IS UPDATED, OTHERWISE RUN THIS MANUALLY IN TERMINAL: pip install wand", 
                "Yes", 
                "No"
            ).then(selection => {
                if (selection === "Yes") {
                    // Open a new terminal with the command typed but not executed
                    const terminal = vscode.window.createTerminal(`Wand Install`);
                    terminal.show();
                    terminal.sendText("pip install wand", false); // false means don't execute

                    // Prompt user to press Enter in terminal
                    vscode.window.showInformationMessage("The terminal has opened with the pip install command. Please press Enter in the terminal to install Wand, then rerun this command.");
                }
            });
        } else if (stdout.trim() === "ImageMagick not installed") {
            // Prompt user to download ImageMagick
            vscode.window.showInformationMessage(
                "ImageMagick is not installed, which is required by Wand. Would you like to download it (installed headers as well in options when downlaoding)?",
                "Download ImageMagick"
            ).then(selection => {
                if (selection === "Download ImageMagick") {
                    vscode.env.openExternal(vscode.Uri.parse("https://imagemagick.org/script/download.php"));
                }
            });
        } else {
            // Wand is installed, proceed with conversion
            const convertCommand = `python "${scriptPath}" -f "${filePath}"`;
            exec(convertCommand, (convertError, convertStdout, convertStderr) => {
                if (convertError) {
                    console.error('Error:', convertError);
                    vscode.window.showErrorMessage(`Error converting file: ${convertError.message}`);
                    return;
                }
                if (convertStderr) {
                    console.error('Script error:', convertStderr);
                }
                if (convertStdout) {
                    console.log('Script output:', convertStdout);
                }
                vscode.window.showInformationMessage(`File converted successfully.`);
            });
        }
    });
    console.log('__DDSToPNGCommand__');
});

module.exports = DDSToPNGCommand;
