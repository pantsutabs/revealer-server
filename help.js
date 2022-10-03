const fs = require('fs');

Date.prototype.toStringSystem = function () {
    return this.getUTCFullYear() + '-' +
        ((this.getUTCMonth() + 1) > 9 ? '' : '0') + (this.getUTCMonth() + 1) + '-' +
        (this.getUTCDate() > 9 ? '' : '0') + this.getUTCDate() + 'T' +
        (this.getUTCHours() > 9 ? '' : '0') + this.getUTCHours() + ':' +
        (this.getUTCMinutes() > 9 ? '' : '0') + this.getUTCMinutes() + ':' +
        (this.getUTCSeconds() > 9 ? '' : '0') + this.getUTCSeconds();
}

function log(...text1) {
    console.log(new Date().toStringSystem(), ...text1);
}

async function getJson(url) {
    return new Promise((resolve, reject) => {
        fs.readFile(url, 'utf8', function readFileCallback(err, data) {
            if (err) {
                reject(err);
            }
            else {
                let dataJson = null;

                try {
                    dataJson = JSON.parse(data);
                } catch (error) {
                    log('cannot turn into json URL: ' + url);
                    reject(error);
                }

                resolve(dataJson);
            }
        });
    });
}

async function saveJson(url, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(url, JSON.stringify(data).replace(/},{/g, '},\n{'), 'utf8', function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function getAllFiles(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

async function copyFile(source, target) {
    return new Promise((resolve, reject) => {
        fs.copyFile(source, target, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
          });
    });
}

if (typeof module !== 'undefined') {
    module.exports = {
        log: log,
        getJson: getJson,
        saveJson: saveJson,
        getAllFiles: getAllFiles,
        copyFile: copyFile,
    }
}