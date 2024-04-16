const vscode = require('vscode');
const { spawn } = require('child_process');

const { getConfig } = require('../support_files/config');


const launchGameCommand = vscode.commands.registerCommand('bg3-mod-helper.launchGame', function () {
    const { launchContinueGame } = getConfig();
    const gameDir = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Baldurs Gate 3\\bin";
    const gamePath = "bg3.exe";
    const args = launchContinueGame ? ["-continueGame"] : [];

    const game = spawn(gamePath, args, { cwd: gameDir });

    game.on('error', (err) => {
        console.error('Failed to start game:', err);
        vscode.window.showErrorMessage('Failed to launch the game. Please check the game path.');
    });

    game.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    game.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    game.on('close', (code) => {
        console.log(`Game process exited with code ${code}`);
    });

    vscode.window.showInformationMessage('Launching the game...');
});