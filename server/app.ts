import express from 'express';
import path from 'path';
import cors from 'cors';
import httpProxy from 'http-proxy';
import fs from 'fs';
import https from 'https';
var privateKey = fs.readFileSync('../cert/server-selfsigned.key', 'utf8');
var certificate = fs.readFileSync('../cert/server-selfsigned.crt', 'utf8');
var ssl = { key: privateKey, cert: certificate };

// Constants
const PORT = 443;

var apiProxy = httpProxy.createProxyServer();
var target = 'https://influxdb:8086';


// App
const app = express();
app.use(cors({
    'allowedHeaders': ['Content-Type'],
    'origin': '*',
    'preflightContinue': true
}));

app.use(express.static('../client/dist/'));

app.all("/influx/*", function (req: any, res: any) {
    console.log('Proxying to influx')
    apiProxy.web(req, res, {
        ssl,
        target: target + req.url.substring(req.url.indexOf("x") + 1),
        secure: false // Prevents errors with self-signed certß
    });
});

app.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, '../client/dist/basic.html'));
});

app.get("*", function (req: any, res: any) {
    res.sendFile(path.join(__dirname, '../client/dist/basic.html'));
});

const httpsServer = https.createServer(ssl, app);
httpsServer.listen(PORT, () => {
    console.log('HTTPS Server running on port ' + PORT);
});
