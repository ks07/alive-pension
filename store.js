const fs = require('fs');
const util = require('util');

const DATAFILE    = 'history.json';
const DATAFILEBKP = 'history.json.bkp';

const fsReadFileP  = util.promisify(fs.readFile);
const fsRenameP    = util.promisify(fs.rename);
const fsWriteFileP = util.promisify(fs.writeFile);

exports.store = async function(hist, summary, funds) {
    console.log('storing');
    await fsRenameP(DATAFILE, DATAFILEBKP)
    hist.push({ timestamp: Date.now(), summary, funds });
    return fsWriteFileP(DATAFILE, JSON.stringify(hist));
}

exports.load = async function() {
    try {
        let data = await fsReadFileP(DATAFILE);
        return JSON.parse(data);
    } catch (err) {
        if (err.code == 'ENOENT') {
            console.error("No historic data found, will start from scratch.");
            return [];
        }
        throw err;
    }
}