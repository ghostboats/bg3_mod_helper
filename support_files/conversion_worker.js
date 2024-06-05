const { CREATE_LOGGER } = require('./log_utils.js');
const { parentPort, workerData } = require('node:worker_threads');

const bg3mh_logger = CREATE_LOGGER();

const { convert } = require('./conversion_junction.js')

function taskIntake() {
    // basic array or file handling stuff
    if (Array.isArray(workerData.task)) {
        for (let i = 0; i < workerData.task.length; i++) {
            
            try {
                let info = `converting ${workerData.task[i]}`;
                bg3mh_logger.info(info)
                // convert(workerData.task[i]);
            } catch (Error) {
                bg3mh_logger.error(`converting ${workerData.task[i]}\n failed with error ${Error}`)
            }  
        }
    } else if (typeof(workerData.task) == 'string') {
        try {
            let info = `converting ${workerData.task}`;
            bg3mh_logger.info(info)
            // convert(workerData.task[i]);
        } catch (Error) {
            bg3mh_logger.error(`converting ${workerData.task}\n failed with error ${Error}`)
        }
    }

    // let the main thread know you're done
    parentPort.postMessage(`worker ${workerData.workerId} done.`);
}

// start it up babyyyyy
taskIntake();