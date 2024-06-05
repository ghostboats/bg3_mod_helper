// what's your function
const path = require('path');
const os = require('os');
const fs = require('fs');

const { FIND_FILES, getFormats } = require('./lslib_utils');
const { lsx, xml, pak } = getFormats();

const { CREATE_LOGGER } = require('./log_utils');
const bg3mh_logger = CREATE_LOGGER();

const { isLoca, processLoca } = require('./loca_convert');
const { isLsf, processLsf } = require('./lsf_convert');
const { processPak, prepareTempDir } = require('./process_pak');

const { isMainThread, workerData, Worker } = require('node:worker_threads');

let getConfig;


// need this outside a function so it's run on load. 
if (isMainThread) {
    getConfig = require('./config.js').getConfig();
} else {
    getConfig = workerData.workerConfig;
}


// this functionality can't work on a worker thread, so i don't think it's possible for it to return undefined. i still need it to not attempt to load the vscode module while in a worker thread, though.
function getActiveTabPath() {
    if (isMainThread) {
        const vscode = require('vscode');
        return vscode.window.activeTextEditor.document.fileName;
    } else {
        return undefined;
    }
}


function jobs(filesNum) {
    let halfCoreCount = Math.floor(os.availableParallelism() / 2);

    return Math.min(filesNum, halfCoreCount);
}


// sorts the files into nested arrays if the amount of files is greater than the number of cores. if not, will just return the original array.
function buildPathArrays(filesToConvert) {
    let filesNum = filesToConvert.length;
    let jobsNum = jobs(filesNum);

    let temp_array = [];
    let fileArrays = [];

    // if these are equal, it will just be one file per core anyways
    if (jobsNum >= filesNum) {
        return filesToConvert;
    // divides files into equal arrrays and sorts them smallest to largest
    } else if (jobsNum < filesNum) {
        for (let i = 0; i < jobsNum; i++) {
            temp_array = [];
            for (let j = 0; j < filesNum; j += jobsNum) {
                let temp_index = i + j;

                // makes sure we're not trying to read beyond the bounds of the number of jobs
                if (filesToConvert[temp_index] !== undefined) {
                    temp_array.push(filesToConvert[temp_index]);
                }
            }
            fileArrays.push(temp_array.sort((file1, file2) => fs.statSync(file1).size - fs.statSync(file2).size));
        }
        return fileArrays;
    }
}


// prepare workerData and spin up workers with what they need to unpack stuff
async function createConversionWorkers(filesToConvert, workerConfig, unpackedGameDataDirectory) {
    // an array of workers
    const workerArray = [];

    filesToConvert = buildPathArrays(filesToConvert);

    // the jobs function returns the lower of half the user's cpu cores or the number of things being unpacked.
    const jobsTotal = jobs(filesToConvert.length);

    // tracks the number of jobs reported completed by the worker threads.
    let jobsFinished = 0;

    // nested .map() functionality :o
    const convertFileNames = filesToConvert.map(fileArray => fileArray.map(file => path.basename(file)));

    // for each job, which is either a single file or an array of files sorted from smallest to largest file size, create a worker and give it the data it needs to unpack those files via workerData.
    for (let i = 0; i < jobsTotal; i++) {
        bg3mh_logger.info(`${convertFileNames[i]}\n`, false);
        workerArray.push(new Worker(__dirname + "/conversion_worker.js", { 
            workerData:  { 
                // passes the crystallized configuration settings to each of the workers
                workerConfig, 
                // adding 2 to the workerId because 0 is the extension host and 1 is the main window
                workerId: i + 2, 
                // passes the path of the file that needs to be converted
                task: filesToConvert[i],
                jobDestPath: unpackedGameDataDirectory
            }
        }));

        // creates a listener for the newly pushed worker. if the worker sends back a message containing "done.", adds 1 to the jobsFinished tracker variable.
        workerArray[i].on('message', (message) => {
            if (message.includes("done.")) {
                bg3mh_logger.info(message);
                jobsFinished++;
            }

            // once the jobsFinished variable is equal to the amount of jobs we started with, we know all jobs are done and can tell the user that.
            if (jobsFinished === jobsTotal) {
                bg3mh_logger.info("All game data unpacked!");
            }
        })
    }
}


// basically just type-checking for the convertPath arg so path.extname doesn't throw a tantrum
function getDynamicPath(filePath) {
    let temp_path;

    //this bit is important since we will only be handing off arrays of specific types to convert()
    if (Array.isArray(filePath) && filePath != []) {
        temp_path = filePath[0];
    }
    else if (typeof(filePath) == 'string') {
        temp_path = filePath;
    }
    else {
        temp_path = getActiveTabPath();
    }

    if (temp_path === undefined) {
        return "null.empty";
    }
    return temp_path;
}


// at the moment this has all the functionality i planned for it, ie lsf, loca, and paks. for any other conversions we can make separate functions
async function convert(convertPath, targetExt = path.extname(getDynamicPath(convertPath)), modName = getConfig.getModName) {
    let rootModPath = getConfig.rootModPath;

    // checks if the convertPath was undefined and halts the function before it goes any further
    if (targetExt === "empty") {
        return;
    }

    // if the targetExt indicates a pack, we need to know what to do with it: are we packing up or unpacking?
    if (targetExt === pak) {
        if (fs.statSync(convertPath).isDirectory()) {
            prepareTempDir();

            await convert(rootModPath, xml)
                .then(() => bg3mh_logger.info(`xml conversion done`, false));

            await convert(rootModPath, lsx)
                .then(() => bg3mh_logger.info(`lsx conversion done`, false));

            processPak(rootModPath, modName);
        }
        // has a check for main thread here because when a worker thread calls this function, it's batch unpacking and has a specific place it needs the files inside to go, but can't rely on vscode module functions to get them
        else if (fs.statSync(convertPath).isFile()) {
            if (isMainThread) {
                processPak(convertPath, modName);
            } else {
                processPak(convertPath, modName, workerData.jobDestPath);
            }
            
        }
    } 
    // this function works best on single files, so we need to process that array and re-run this function with each of its elements
    else if (Array.isArray(convertPath)) {
        // console.log('array1')
        for (let i = 0; i < convertPath.length; i++) {
            convert(convertPath[i], path.extname(convertPath[i]));
        }
    } 
    // if this function is passsed a directory, parse it into an array of files of the specified type in targetExt, then send that back through
    else if (fs.statSync(convertPath).isDirectory()) {
        // console.log('plz1')
        const filesToConvert = await FIND_FILES(targetExt);
        convert(filesToConvert);
    } 
    // finally, if this function is handed a file, convert that bitch :catyes:
    else if (fs.statSync(convertPath).isFile()) {
        // console.log('plz2')
        if (isLoca(targetExt)) {
            try {
                processLoca(convertPath, targetExt);
            } 
            catch (Error) {
                bg3mh_logger.error(Error);
                return;
            }
        } 
        if (isLsf(targetExt)) {
            try {
                processLsf(convertPath, targetExt);
            } 
            catch (Error) {
                bg3mh_logger.error(Error);
                return;
            }
        }
    }
}


module.exports = { convert, jobs, createConversionWorkers };