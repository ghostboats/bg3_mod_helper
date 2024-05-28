const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils.js');
const bg3mh_logger = CREATE_LOGGER();
const { parentPort, workerData } = require('node:worker_threads');
const path = require('node:path');
const fs = require('node:fs');


const { convert } = require('../support_files/conversion_junction.js')

function taskIntake() {
    // console.log(workerData.task)
    if (Array.isArray(workerData.task)) {
        for (let i = 0; i < workerData.task.length; i++) {
            console.log(`converting ${workerData.task[i]}`)
            // convert(workerData.task[i]);
        }
    } else if (typeof(workerData.task) == 'string') {
        // convert(workerData.task);
    }
    
}

taskIntake();