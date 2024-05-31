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
            
            try {
                raiseInfo(`converting ${workerData.task[i]}`);
                // convert(workerData.task[i]);
            } catch (Error) {
                raiseError(`converting ${workerData.task[i]}\n failed with error ${Error}`);
            }  
        }
    } else if (typeof(workerData.task) == 'string') {
        try {
            raiseInfo(`converting ${workerData.task}`);
            // convert(workerData.task);
        } catch (Error) {
            raiseError(`converting ${workerData.task}\n failed with error ${Error}`);
        }
    }

    parentPort.postMessage(`worker ${workerData.workerId} done.`);
}

taskIntake();