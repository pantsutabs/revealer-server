const path = require('path');

async function extraRoutes(app) {
    let getExtraFilesHtml = async (req, res) => {
        res.setHeader("Content-Type", "text/html")
        try {
            let paramsId = Number.parseInt(req.params.id);
            res.send(`
            <html>
            </html>

            <body>
                <div>
                    <img style="width:20vmax" src="/${paramsId}.png">
                    <img style="width:20vmax" src="/pfp/${paramsId}.png">

                    <img style="width:20vmax" src="/xmas/${paramsId}.png">
                    <img style="width:20vmax" src="/xmas_pfp/${paramsId}.png">
                </div>
            </body>
            `);
        } catch (error) {
            help.log(error, req.ip);
            genericReturnFalse(res);
        }
    }
    app.route('/extra/:id').get(getExtraFilesHtml);
    app.route('/extra').get(async (req,res) => {
        res.sendFile(path.join(__dirname, '/public/extra.html'));
    });
}

if (typeof module !== 'undefined') {
    module.exports = {
        extraRoutes: extraRoutes,
    }
}