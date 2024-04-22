const vscode = require('vscode');
const fs = require('fs');
const path = require('path')

const { LOAD_LSLIB } = require('./lslib_utils');
const { LSLIB, sys } = LOAD_LSLIB();
const LocaUtils = LSLIB.LocaUtils;
const LocaFormat = LSLIB.LocaFormat;
const LocaResource = LSLIB.LocaResource;
const extension = LocaFormat.extension;


const { getConfig }  = require('../../config.js');
const { divinePath } = getConfig();

var File;
var FileMode;

var in_format;
var out_format;
var target_file;

function testing() {
    console.log("Getting Localization file extension values...");

    // i love javscript types!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    in_format = LocaFormat.Xml | 0;
    out_format = LocaFormat.Loca | 0;

    console.log(in_format + "\n" + out_format);
    console.log(typeof(LocaUtils));

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
    const writeableStream = fs.createWriteStream(filePath);

    writeableStream.on('error', function (error) {
        console.log(`error: ${error.message}`);
    })

    writeableStream.on('data', (chunk) => {
        console.log(chunk);
    })

    return writeableStream;
}


function convert() {
    console.log("opening convert function....")
    // console.log(__dirname);
    var xml_test = path.normalize(__dirname + "/text.xml");
    var loca_test = path.normalize(__dirname + "/text.loca");

    // console.log(xml_test + "\n" + loca_test)
    console.log(typeof(LocaFormat.Xml) + "\n" + typeof(LocaFormat.Loca));

    try {
        //console.log("Loaded XML file: " + loca_resource);
        var temp_loca = LocaUtils.Load(loca_test);

        LocaUtils.Save(temp_loca, xml_test);
        console.log("Exported loca file: " + loca_test);
    }
    catch (error) {
        console.error(error);
    }
}


module.exports = { 
    testing, convert
};

