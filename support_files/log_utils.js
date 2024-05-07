const path = require('path');
const vscode = require('vscode');

const lslibPath = require('./config').getConfig().lslibPath;
const logPath = path.normalize(lslibPath + "\\logs\\bg3mh_log_" + LOGDATE() + ".log");

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
            },
            error: {
                appenders: 
                    ["bg3mh_logger"], 
                    level: "error",
                    enableCallStack: true
            },
            info: {
                appenders: 
                    ["bg3mh_logger"], 
                    level: "info",
                    enableCallStack: true
            },
        },
    });

    return log4js.getLogger("bg3mh_logger");
}


function raiseError(error, popup = true) {
    var bg3mh_logger = CREATE_LOGGER();

    if (popup) {
        vscode.window.showErrorMessage(`${error}`);
    }
    console.error(error);
    bg3mh_logger.error(error);
}

function raiseInfo(info, popup = true) {
    var bg3mh_logger = CREATE_LOGGER();

    if (popup) {
        vscode.window.showInformationMessage(`${info}`);
    }
    console.info(info);
    bg3mh_logger.info(info);
}


module.exports = { LOGDATE, logPath, CREATE_LOGGER, raiseError, raiseInfo };