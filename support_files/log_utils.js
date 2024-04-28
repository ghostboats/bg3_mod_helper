const path = require('path');
const divinePath = require('./config').getConfig().divinePath;

const logPath = path.normalize(divinePath + "\\logs\\bg3mh_log_" + LOGDATE() + ".log");

// TODO: clear logs function



function LOGDATE() {
    var date = new Date();
    var year = date.getFullYear();
    var month = `${date.getMonth() + 1}`.padStart(2, "0");
    var day = `${date.getDate()}`.padStart(2, "0");
    var hour = `${date.getHours()}`.padStart(2, "0");
    var minute = `${date.getMinutes()}`.padStart(2, "0");
    var second = `${date.getSeconds()}`.padStart(2, "0");;
    var date_string = `${year}${month}${day}` + "-" + `${hour}${minute}${second}`;

    return date_string;
}


function CREATE_LOGGER() {
    var log4js = require('log4js');
    log4js.configure ({
        appenders: { 
            bg3mh_logger: { 
                type: "file", 
                filename: logPath,
                layout: {
                    type: "pattern",
                    pattern: "[%d] %f{1}:%l in %M [%p]: %m"
                }
            } 
        },
        categories: {
            default: {
                appenders: 
                    ["bg3mh_logger"], 
                    level: "debug",
                    enableCallStack: true
            } 
        },
    });
    const bg3mh_logger = log4js.getLogger("bg3mh_logger");

    return bg3mh_logger;
}


module.exports = { LOGDATE, logPath, CREATE_LOGGER }