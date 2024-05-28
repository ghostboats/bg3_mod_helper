const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils.js');
const bg3mh_logger = CREATE_LOGGER();
const { parentPort, workerData } = require('node:worker_threads');
const path = require('node:path');
const fs = require('node:fs');
const { LOAD_LSLIB } = require('../support_files/lslib_utils.js')


parentPort.once('message', async () => {
    raiseInfo(`lookee lslib @ ${workerData.lslibPath}`)
    parentPort.postMessage("i got the workerData bitchhhhhhh");

    /*try {
        let LSLIB = await LOAD_LSLIB();
    } catch (Error) {
        raiseError(Error);
    }*/
});