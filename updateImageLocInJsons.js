const help = require('./help.js');

let newFormat = process.argv[2];

async function updateImageLocations() {
    let privateUrl = './private/json/';
    let publicUrl = './public/json/';
    let privateFiles = await help.getAllFiles(privateUrl);
    let publicFiles = await help.getAllFiles(publicUrl);

    for(let i=0; i<privateFiles.length; i++) {
        let fileName = privateFiles[i];
        if (Number.isInteger(Number.parseInt(fileName.split('.')[0]))) {
            let file = await help.getJson(privateUrl + fileName);
            let fileNameNum = Number.parseInt(fileName.split('.')[0]);

            file.image = newFormat.split('<ID>').join(fileNameNum);

            await help.saveJson(privateUrl + fileName, file);
            help.log("UPDATED", privateUrl + fileName);
        }
    }
    
    for(let i=0; i<publicFiles.length; i++) {
        let fileName = publicFiles[i];
        if (Number.isInteger(Number.parseInt(fileName.split('.')[0]))) {
            let file = await help.getJson(publicUrl + fileName);
            let fileNameNum = Number.parseInt(fileName.split('.')[0]);

            file.image = newFormat.split('<ID>').join(fileNameNum);

            await help.saveJson(publicUrl + fileName, file);
            help.log("UPDATED", publicUrl + fileName);
        }
    }
}


async function start() {
    help.log("UPDATING IMAGE LOCATIONS");
    await updateImageLocations();
    help.log("UPDATING IMAGE LOCATIONS - DONE");
}

start();