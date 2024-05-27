// const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils.js');
// const bg3mh_logger = CREATE_LOGGER();
const { parentPort } = require('node:worker_threads');
const path = require('node:path');
const fs = require('node:fs');


parentPort.once('message', (message) => {
    let messageParsed = JSON.parse(message);

    let rootModPath = messageParsed.rootModPath;
    parentPort.postMessage(rootModPath);
});