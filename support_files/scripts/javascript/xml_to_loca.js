const vscode = require('vscode');
const fs = require('fs');
const path = require('path')

const { LOAD_LSLIB } = require('./lslib_utils');
const { LSLIB } = LOAD_LSLIB();
const LocaUtils = LSLIB.LocaUtils;
const LocaFormat = LSLIB.LocaFormat;

const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();

var in_format;
var out_format;
var target_file;

function testing() {
    console.log("Getting Localization file extension values...");

    in_format = LocaFormat.Xml;
    out_format = LocaFormat.Loca;

    console.log(in_format + "\n" + out_format);
    console.log(typeof(LocaUtils));

    // console.log(lslib + "\n" + LocaUtils + "\n" + LocaFormat);

}

function errorLog(error) {
    console.error(error);
}


async function aReadFile(path) {
    var tempFile = await fs.readFile(path, (error) => {
        errorLog(error);
    });
    return tempFile;
}


function read(filePath) {
    const readableStream = fs.createReadStream(filePath);

    readableStream.on('error', function (error) {
        console.log(`error: ${error.message}`);
    })

    readableStream.on('data', (chunk) => {
        console.log(chunk);
    })

    return readableStream;
}


function convert() {
    console.log("opening convert function....")
    console.log(__dirname);
    var xml_test = path.normalize(__dirname + "/text.xml");
    var loca_test = path.normalize(__dirname + "/text.loca");

    console.log(xml_test + "\n" + loca_test)

    target_file = read(xml_test);
    console.log("Found XML file: " + target_file);

    try {
        LocaUtils.Load(target_file, in_format);
        console.log("Loaded XML file: " + target_file);

        LocaUtils.Save(loca_test, target_file, out_format);
        console.log("Exported loca file: " + loca_test);
    }
    catch (error) {
        console.error(error);
    }
}


module.exports = { 
    testing, convert
};

