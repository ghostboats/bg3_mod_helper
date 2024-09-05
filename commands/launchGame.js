const vscode = require('vscode');
const { spawn } = require('child_process');
const path = require('path');

const { getConfig } = require('../support_files/config');


const launchGameCommand = vscode.commands.registerCommand('bg3-mod-helper.launchGame', function () {
    const { launchContinueGame, gameInstallLocation, laucherAPI } = getConfig();
    if (!gameInstallLocation || gameInstallLocation === "") {
        vscode.window.showErrorMessage('Game installation location is not set. Please configure it correctly in settings.');
        return; // Stop execution if the path is not set
    }

    const executableName = laucherAPI === 'DirectX' ? 'bg3_dx11.exe' : 'bg3.exe';

    // Construct the path to the executable
    const binLocation = path.join(gameInstallLocation, 'bin');
    const gamePath = path.join(binLocation, executableName);
    const args = launchContinueGame ? ["-continueGame"] : [];

    const game = spawn(gamePath, args, { cwd: binLocation });

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