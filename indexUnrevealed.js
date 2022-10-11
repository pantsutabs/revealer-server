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

let templateJson;

async function start() {
    app.use(helmet());
    app.use(express.json({ limit: '100kb' })); // to support JSON-encoded bodies, limit is optional and 100kb is default, it limits how big a body can be, It is probably better to also implement via nginx
    app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies

    // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc) - We probably will be in production, this is very important for the rate limiter, although an nginx rate limiter is definitely a better idea
    // What this does is primarily pass a user's IP through nginx, irrelevant here
    // see https://expressjs.com/en/guide/behind-proxies.html
    //app.set('trust proxy', 1); // Remove if NOT behind a reverse proxy

    // get json
    app.route('/json/:id.json').get(async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
            let newJson = Object.assign({},templateJson);
            let currentUrl = (req.protocol + '://' + req.get('host') + req.originalUrl).split('/');
            currentUrl.splice(currentUrl.length-2,2);
            currentUrl = currentUrl.join('/');
            newJson.name = newJson.name.split(':id').join(req.params.id);
            newJson.image = currentUrl + newJson.image;//req.params.id;
            res.send(JSON.stringify(newJson));
        } catch (error) {
            help.log(error, req.ip, req.headers.authorization);
            genericReturnFalse(res);
        }
    });

    templateJson = await help.getJson('./public/json/0_unrevealed.json');

    app.set('port', port);
    app.use('/', express.static(__dirname + '/public'));
    app.listen(port, () => console.log('Endpoint for revealer (UNREVEALED) on port ' + port));
}

start();