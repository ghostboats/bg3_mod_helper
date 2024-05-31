const { raiseError, raiseInfo } = require('./log_utils.js');
const { parentPort, workerData } = require('node:worker_threads');


const { convert } = require('./conversion_junction.js')

function taskIntake() {
    // basic array or file handling stuff
    if (Array.isArray(workerData.task)) {
        for (let i = 0; i < workerData.task.length; i++) {
            
            try {
                raiseInfo(`converting ${workerData.task[i]}`);
                convert(workerData.task[i]);
            } catch (Error) {
                raiseError(`converting ${workerData.task[i]}\n failed with error ${Error}`);
            }  
        }
    } else if (typeof(workerData.task) == 'string') {
        try {
            raiseInfo(`converting ${workerData.task}`);
            convert(workerData.task);
        } catch (Error) {
            raiseError(`converting ${workerData.task}\n failed with error ${Error}`);
        }
    }

    // let the main thread know you're done
    parentPort.postMessage(`worker ${workerData.workerId} done.`);
}

// start it up babyyyyy
taskIntake();