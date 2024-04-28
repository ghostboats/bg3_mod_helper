const path = require('path');
const divinePath = require('../../config').getConfig().divinePath;

const logPath = path.normalize(divinePath + "\\logs\\" + path.basename("bg3mh-log") + " - " + LOGDATE() + ".log");


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


function multiLogger(message) {
    // maybe send log messages to debug console and log file? idk if possible

}


module.exports = { LOGDATE, logPath }