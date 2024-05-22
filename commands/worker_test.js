const { CREATE_LOGGER, raiseError, raiseInfo } = require('../support_files/log_utils.js');
const bg3mh_logger = CREATE_LOGGER();

const { parentPort } = require('worker_threads');

function test_func() {
    raiseInfo("hi dipshit :)");
    return "hi dipshit :)";
    
}


