const path = require('path');

var lslibPath;
var logPath;

const { isMainThread } = require('worker_threads');

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

var raiseError, raiseInfo, CREATE_LOGGER;


if (isMainThread) {
    const vscode = require('vscode');
    lslibPath = require('./config').getConfig().lslibPath;
    logPath = path.normalize(lslibPath + "\\logs\\bg3mh_log_" + LOGDATE() + ".log");

    CREATE_LOGGER = () => {
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

    raiseError = (error, popup = true) => {
        var bg3mh_logger = CREATE_LOGGER();
    
        if (popup) {
            vscode.window.showErrorMessage(`${error}`);
        }
        console.error(error);
        bg3mh_logger.error(error);
    }
    
    raiseInfo = (info, popup = true) => {
        var bg3mh_logger = CREATE_LOGGER();
    
        if (popup) {
            vscode.window.showInformationMessage(`${info}`);
        }
        console.info(info);
        bg3mh_logger.info(info);
    }
} else {
    lslibPath = require('./config').getConfig().lslibPath;
    logPath = path.normalize(lslibPath + "\\logs\\bg3mh_log_" + LOGDATE() + ".log");

    CREATE_LOGGER = () => {
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

    raiseError = (error) => {
        var bg3mh_logger = CREATE_LOGGER();

        console.error(error);
        bg3mh_logger.error(error);
    }
    
    raiseInfo = (info) => {
        var bg3mh_logger = CREATE_LOGGER();

        console.info(info);
        bg3mh_logger.info(info);
    }
}




module.exports = { LOGDATE, logPath, CREATE_LOGGER, raiseError, raiseInfo };