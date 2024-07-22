const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

const { getConfig } = require('../support_files/config');
const { rootModPath } = getConfig();

console.log("FFmpeg Path:", ffmpegPath);
console.log("Type of FFmpeg Path:", typeof ffmpegPath);

if (typeof ffmpegPath === 'string') {
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    console.error("FFmpeg Path is not a string");
}

// Command to open the video conversion webview
const convertVideoToGifCommand = vscode.commands.registerCommand('bg3-mod-helper.convertVideoToGif', async function () {
    const panel = vscode.window.createWebviewPanel(
        'videoConversion',
        'Video Conversion',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const videoFiles = await getAllVideoFiles(rootModPath);

    panel.webview.html = getWebviewContent(videoFiles);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(async message => {
        switch (message.command) {
            case 'convert':
                await convertVideoToGifFile(message.videoPath, message.gifPath);
                break;
            case 'convertAll':
                for (const video of videoFiles) {
                    const gifPath = video.replace(path.extname(video), '.gif');
                    await convertVideoToGifFile(video, gifPath);
                }
                break;
            case 'selectFile':
                const options = {
                    canSelectMany: false,
                    openLabel: 'Select a video file',
                    filters: { 'Video files': ['mp4', 'mkv', 'avi', 'mov'] }
                };
                const fileUri = await vscode.window.showOpenDialog(options);
                if (fileUri && fileUri[0]) {
                    const videoPath = fileUri[0].fsPath;
                    const gifPath = videoPath.replace(path.extname(videoPath), '.gif');
                    await convertVideoToGifFile(videoPath, gifPath);
                }
                break;
        }
    });
});

async function getAllVideoFiles(dir) {
    let files = [];
    const items = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(await getAllVideoFiles(fullPath));
        } else if (/\.(mp4|mkv|avi|mov)$/i.test(item.name)) {
            files.push(fullPath);
        }
    }
    return files;
}

function getWebviewContent(videoFiles) {
    const videoFileItems = videoFiles.map(file => `
        <tr>
            <td>${path.basename(file)}</td>
            <td>${file}</td>
            <td><button onclick="convert('${file.replace(/\\/g, '\\\\')}', '${file.replace(path.extname(file), '.gif').replace(/\\/g, '\\\\')}')">Convert</button></td>
        </tr>
    `).join('');

    return `
        <html>
            <body>
                <h1>Video Conversion</h1>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Path</th>
                        <th>Action</th>
                    </tr>
                    ${videoFileItems}
                </table>
                <button onclick="convertAll()">Convert All</button>
                <button onclick="selectFile()">Find Video File on Computer</button>
                <script>
                    const vscode = acquireVsCodeApi();
                    function convert(videoPath, gifPath) {
                        vscode.postMessage({ command: 'convert', videoPath: videoPath, gifPath: gifPath });
                    }
                    function convertAll() {
                        vscode.postMessage({ command: 'convertAll' });
                    }
                    function selectFile() {
                        vscode.postMessage({ command: 'selectFile' });
                    }
                </script>
            </body>
        </html>
    `;
}

async function convertVideoToGifFile(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const normalizedInput = path.normalize(inputPath);
        const normalizedOutput = path.normalize(outputPath);

        console.log("Normalized Input Path:", normalizedInput);
        console.log("Normalized Output Path:", normalizedOutput);

        ffmpeg(normalizedInput)
            .outputOptions([
                '-vf', 'fps=24', // Increase fps for smoother animation
                '-gifflags', 'transdiff',
                '-y', // Overwrite output files without asking
                '-q:v', '5' // Set quality level (lower is better, 0 is the best quality)
            ])
            .save(normalizedOutput)
            .on('end', () => {
                vscode.window.showInformationMessage(`GIF created: ${normalizedOutput}`);
                resolve();
            })
            .on('error', (err) => {
                vscode.window.showErrorMessage(`Error: ${err.message}`);
                reject(err);
            });
    });
}


module.exports = { convertVideoToGifCommand };
