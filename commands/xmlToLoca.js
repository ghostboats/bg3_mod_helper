const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const util = require('util');

const { exec } = require('child_process')
const execAsync = util.promisify(require('child_process').exec);

const { convert, compatRootModPath} = require('../support_files/conversion_junction.js');

const { getFormats } = require('../support_files/lslib_utils.js');
const { loca, xml } = getFormats();


const xmlToLocaCommand = vscode.commands.registerCommand('bg3-mod-helper.xmlToLoca', async function () {

    convert(compatRootModPath, xml);

});

async function processLocalizationFiles(rootModPath, divinePath, singleFileConversion) {
    const localizationPath = path.join(rootModPath, "Localization");
    let xmlCount = 0, locaCount = 0;
    let xmlPaths = [], locaPaths = []; // Changed to arrays
    // Check if Localization folder exists
    if (fs.existsSync(localizationPath) && fs.lstatSync(localizationPath).isDirectory()) {
        // Recursively read the Localization directory
        const filesQueue = [localizationPath];

        while (filesQueue.length > 0) {
            const currentPath = filesQueue.pop();
            const files = fs.readdirSync(currentPath);

            for (const file of files) {
                const fullPath = path.join(currentPath, file);
                const stat = fs.lstatSync(fullPath);

                if (stat.isDirectory()) {
                    filesQueue.push(fullPath);
                } 
                else if (fullPath.endsWith(".xml")) {
                    xmlCount++;
                    xmlPaths.push(fullPath); // Push to array
                } 
                else if (fullPath.endsWith(".loca")) {
                    locaCount++;
                    locaPaths.push(fullPath); // Push to array
                }
            }
        }

        if (xmlCount === 0) {
            vscode.window.showErrorMessage('No XML file found.');
            return
        }

        if (singleFileConversion) {
            console.log('Single xml to loca being used from settings')
            if (xmlPaths.length === 0) {
                vscode.window.showErrorMessage('No XML file found.');
                return;
            }
            const pickedFile = await vscode.window.showQuickPick(xmlPaths, {
                placeHolder: 'Select an XML file to convert',
            });
            if (pickedFile) {
                let outputPath = pickedFile.replace(".xml", ".loca");
                console.log('Parameters used in python script:');
                console.log('divinePath:',divinePath,'\noutputPath:',outputPath,'\nxmlPath:',pickedFile);
                try {
                    await executePythonScript(divinePath, outputPath, pickedFile);
                    vscode.window.showInformationMessage(pickedFile + ' used to create loca file');
                } 
                catch (error) {
                    vscode.window.showErrorMessage('Error processing file: ' + pickedFile + '; Error: ' + error.message);
                }
            }
        } else {
            console.log('Converting all xml files in Localization folder')
            for (const xmlPath of xmlPaths) {
                let outputPath = xmlPath.replace(".xml", ".loca");
                console.log("why are you like this");
                console.log("divinePath:" + divinePath + "\noutputPath:" + outputPath + "\nxmlPath:" + xmlPath);
        
                try {
                    executePythonScript(divinePath, outputPath, xmlPath);
                    vscode.window.showInformationMessage('Loca file created using '+xmlPath);
                } 
                catch (error) {
                    vscode.window.showErrorMessage('Error processing file: ' + xmlPath + '; Error: ' + error.message);
                }
            }
        }
    } 
    else {
        vscode.window.showInformationMessage('Localization folder not found.');
    }
};

// made this function not async- not sure if it needed to be?
function executePythonScript(divinePath, outputPath, filePath) {
    const scriptPath = path.join(__dirname, '..', 'support_files', 'python_scripts', 'xml_to_loca.py');
    // const command = "python " + scriptPath + " -d " + divinePath + " -o " + outputPath + " -f " + filePath;
    const locaCommand = `python "${scriptPath}" -d "${divinePath}" -o "${outputPath}" -f "${filePath}"`;
    // const convertC = `python "${scriptPath}" -d "${divinePath}" -b -f "${rootModPath}"`; 
    // truncated to check for missing characters. i have no idea why this one throws fits and the other one doesn't
    
    exec (
        locaCommand, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
            }
        }
    );
}