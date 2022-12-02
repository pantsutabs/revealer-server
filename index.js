const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { ethers } = require("ethers");
const express = require('express');
const helmet = require('helmet');
const help = require('./help.js');
const {extraRoutes} = require('./extra.js');
const app = express();
const port = 3000;

async function genericReturnFalse(res) {
    res.send(JSON.stringify({
        success: false
    }));
}

let config;
let templateJson;
let templateJsonImageParsed = false;

let provider;

let newTokenIds = [];

// I don't think this actually works, even with a spoofed agent
// but it's not like it breaks anything either so whatever
async function spamOpenseaWithMetadataRefreshRequests() {
    setInterval(async () => {
        if (newTokenIds.length > 0) {
            try {
                let newTokenId = newTokenIds.splice(0, 1)[0];

                let requestUrl = "https://api.opensea.io/api/v1/asset/" + config.contractAddress + "/" + newTokenId + "/?force_update=true";

                let response = await fetch(requestUrl, {
                    "credentials": "omit",
                    "headers": {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Dest": "document",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-User": "?1",
                        "Pragma": "no-cache",
                        "Cache-Control": "no-cache"
                    },
                    "method": "GET",
                    "mode": "cors"
                });

                //let data = await response.json();

                console.log(response);

                help.log("REQUESTING REFRESH FOR TOKEN ID ", newTokenId);
            } catch (error) {
                console.log(error);
            }
        }
    }, 61000)
}

async function getTotalSupplyAndUpdate() {
    try {
        let totalSupply = (await new ethers.Contract(config.contractAddress, ["function totalSupply() view returns (uint256)"], provider).totalSupply()).toNumber()

        if (totalSupply > 0 && totalSupply > config.lastTokenId) {
            config.lastTokenId = totalSupply;
            await updateConfig();
            help.log("UPDATED LAST TOKEN", totalSupply);
            syncFiles();
        }
        else {
            //help.log("NO TOKEN SUPPLY CHANGES");
        }
    } catch (error) {

    }
}

async function totalSupplyLoop() {
    provider = new ethers.providers.JsonRpcProvider(config.rpc);

    getTotalSupplyAndUpdate();

    setInterval(async () => {
        getTotalSupplyAndUpdate();
    }, 30000)

}

async function syncFiles() {
    help.log("SYNCING FILES");
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

            // remember to request refresh from opensea later
            newTokenIds.push(fileName.split(".")[0]);
        }
    }

    help.log("SYNCING EXTRA FILES");
    {
        for (let i = 0; i < config.extraPrivateFolders.length; i++) {
            let extraPrivateFolder = config.extraPrivateFolders[i];
            let privateUrl = './private/' + extraPrivateFolder + '/';
            let publicUrl = './public/' + extraPrivateFolder + '/';
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

}

async function updateConfig() {
    await help.saveJson('./config.json', config);
}

function getCurrentUrl(req, truncParts) {
    let currentUrl = (req.protocol + '://' + req.get('host') + req.originalUrl).split('/');
    currentUrl.splice(currentUrl.length - truncParts, truncParts); // this truncates the /json/:id part
    currentUrl = currentUrl.join('/');
    return currentUrl;
}

async function start() {
    app.use(helmet());
    app.use(express.json({ limit: '100kb' })); // to support JSON-encoded bodies, limit is optional and 100kb is default, it limits how big a body can be, It is probably better to also implement via nginx
    app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc) - We probably will be in production, this is very important for the rate limiter, although an nginx rate limiter is definitely a better idea
    // What this does is primarily pass a user's IP through nginx, irrelevant here
    // see https://expressjs.com/en/guide/behind-proxies.html
    app.set('trust proxy', 1); // Remove if NOT behind a reverse proxy

    let getJson = async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
            if (!templateJsonImageParsed) {
                templateJsonImageParsed = true;
                templateJson.image = getCurrentUrl(req, 2) + templateJson.image;
            }
            if (!Number.parseInt(req.params.id)) {
                genericReturnFalse(res);
                return;
            }

            let paramsId = Number.parseInt(req.params.id);
            let jsonTemp = Object.assign({}, templateJson);
            let jsonRes = jsonTemp;

            try {
                jsonRes = await help.getJson('./public/json/' + paramsId + '.json');
                jsonRes.image = getCurrentUrl(req, 2) + "/" + paramsId + ".png";
            }
            catch (error) {
                // if should have token data but for some reason doesn't
                if (paramsId <= config.lastTokenId) {
                    help.log('FAILED LOADING MINTED TOKEN DATA', error, req.ip);
                    genericReturnFalse(res);
                    return;
                }
                // otherwise it's probably not revealed/minted yet
                else {
                    jsonTemp.name = jsonTemp.name.split(':id').join(paramsId);
                }
            }

            res.send(JSON.stringify(jsonRes));
        } catch (error) {
            help.log(error, req.ip);
            genericReturnFalse(res);
        }
    }


    app.route('/json/:id.json').get(getJson);
    app.route('/json/:id').get(getJson);

    config = await help.getJson('./config.json');
    
    if(config.extraRoutes) {
        extraRoutes(app);
    }

    help.log("CONFIG:", config);

    // sync files
    await syncFiles();

    help.log("SYNCING DONE");

    // this starts an interval to check for total supply every 5 minutes
    if (config.autoRevealEnabled) {
        totalSupplyLoop();
    }

    //spamOpenseaWithMetadataRefreshRequests();

    templateJson = await help.getJson('./public/json/0_unrevealed.json');

    app.set('port', port);
    app.use('/', express.static(__dirname + '/public'));
    app.listen(port, () => console.log('Endpoint for revealer on port ' + port));
}

start();