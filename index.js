const express = require('express');
const helmet = require('helmet');
const help = require('./help.js');
const app = express();
const port = 3000;

async function genericReturnFalse(res) {
    res.send(JSON.stringify({
        success: false
    }));
}

let config;

async function syncFiles() {
    help.log("SYNCING FILES");
    help.log("SYNCING JSONS");
    {
        let privateUrl = './private/json/';
        let publicUrl = './public/json/';
        let privateFiles = await help.getAllFiles(privateUrl);
        let publicFiles = await help.getAllFiles(publicUrl);
        let lastTokenId = config.lastTokenId;
        let publicFilesTarget = [];
        let publicFilesMissing = [];
        // make list of everything that should be in public (every id in private < lastTokenId)
        privateFiles.forEach(fileName => {
            if (Number.isInteger(Number.parseInt(fileName.split('.')[0])) && Number.parseInt(fileName.split('.')[0]) <= lastTokenId) {
                publicFilesTarget.push(fileName);
            }
        });

        // go over all files that should be in public and mark ones that aren't
        publicFilesTarget.forEach(fileName => {
            if (!publicFiles.includes(fileName)) {
                publicFilesMissing.push(fileName);
            }
        });

        // move all files that were marked missing
        for (let i = 0; i < publicFilesMissing.length; i++) {
            let fileName = publicFilesMissing[i];
            await help.copyFile(privateUrl + fileName, publicUrl + fileName);
            help.log("MOVED FILE", publicUrl + fileName);
        }
    }
    help.log("SYNCING IMAGES");
    {
        let privateUrl = './private/';
        let publicUrl = './public/';
        let privateFiles = await help.getAllFiles(privateUrl);
        let publicFiles = await help.getAllFiles(publicUrl);
        let lastTokenId = config.lastTokenId;
        let publicFilesTarget = [];
        let publicFilesMissing = [];
        // make list of everything that should be in public (every id in private < lastTokenId)
        privateFiles.forEach(fileName => {
            if (Number.isInteger(Number.parseInt(fileName.split('.')[0])) && Number.parseInt(fileName.split('.')[0]) <= lastTokenId) {
                publicFilesTarget.push(fileName);
            }
        });

        // go over all files that should be in public and mark ones that aren't
        publicFilesTarget.forEach(fileName => {
            if (!publicFiles.includes(fileName)) {
                publicFilesMissing.push(fileName);
            }
        });

        // move all files that were marked missing
        for (let i = 0; i < publicFilesMissing.length; i++) {
            let fileName = publicFilesMissing[i];
            await help.copyFile(privateUrl + fileName, publicUrl + fileName);
            help.log("MOVED FILE", publicUrl + fileName);
        }
    }
    
}

async function updateConfig() {
    await help.saveJson('./config.json', config);
}

async function start() {
    app.use(helmet());
    app.use(express.json({ limit: '100kb' })); // to support JSON-encoded bodies, limit is optional and 100kb is default, it limits how big a body can be, It is probably better to also implement via nginx
    app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc) - We probably will be in production, this is very important for the rate limiter, although an nginx rate limiter is definitely a better idea
    // What this does is primarily pass a user's IP through nginx, irrelevant here
    // see https://expressjs.com/en/guide/behind-proxies.html
    //app.set('trust proxy', 1); // Remove if NOT behind a reverse proxy

    // post
    app.route('/api/post/updateLastTokenId/').post(async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
            //req.body.lastTokenId, - the token to move up to
            //req.headers.authorization - some password
            if (req.headers.authorization == config.authorization && req.body.lastTokenId > 0) {
                config.lastTokenId = req.body.lastTokenId;
                await updateConfig();
                help.log("UPDATED LAST TOKEN", req.headers.authorization, req.body);
            }
            else {
                help.log("UPDATE ERROR", req.headers, req.body);
            }


            syncFiles();

            res.send(JSON.stringify({
                success: true
            }));
        } catch (error) {
            help.log(error, req.ip, req.headers.authorization);
            genericReturnFalse(res);
        }
    });

    config = await help.getJson('./config.json');

    help.log("CONFIG:", config);

    await syncFiles();
    help.log("SYNCING DONE");

    app.set('port', port);
    app.use('/', express.static(__dirname + '/public'));
    app.listen(port, () => console.log('Endpoint for revealer on port ' + port));
}

start();