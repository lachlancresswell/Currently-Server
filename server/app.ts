import express from 'express';
import path from 'path';
import cors from 'cors';
import httpProxy from 'http-proxy';
import fs from 'fs';
import os from "os";
import http from 'http';
import https from 'https';
import makeMdns, { Options } from 'multicast-dns';
var privateKey = fs.readFileSync('../cert/server-selfsigned.key', 'utf8');
var certificate = fs.readFileSync('../cert/server-selfsigned.crt', 'utf8');
var ssl = { key: privateKey, cert: certificate };


const nets: any = os.networkInterfaces();
let nicAddresses: { nic: string, ip: string, mask: string | null }[] = []; // Or just '{}', an empty object

if (nets) {
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                nicAddresses.push({ nic: name, ip: net.address, mask: net.cidr });
            }
        }
    }
}

const options: Options = {
    loopback: true,
}
const mdns = makeMdns(options);
interface addressObj {
    ip: string,
    local: boolean
}
let neighbours: { addresses: any[] } = { addresses: [] };

mdns.on('response', function (response: any) {
    console.log('got a response packet:', response)

    // Find if response is a loopback e.g the local device
    let local = false;
    nicAddresses.forEach((address: { nic: string, ip: string, mask: string | null }) => {
        if (address.ip === response.answers[2].data && (response.answers[0].data.port === HTTPS_PORT || response.answers[0].data.port.toString === HTTP_PORT)) local = true;
    })

    neighbours.addresses.filter((address: { ip: string, local: boolean }) => (address.ip === (response.answers[2].data as string) + ':' + response.answers[1].data.port && address.local === local)).length

    if (response.answers[0]
        && response.answers[0].type === 'SRV'
        && (response.answers[0].name === HTTP_MDNS_SERVICE_NAME || response.answers[0].name === HTTPS_MDNS_SERVICE_NAME)
        && !neighbours.addresses.filter((address: { ip: string, local: boolean }) => (address.ip === (response.answers[2].data as string) + ':' + response.answers[1].data.port && address.local === local)).length)
        neighbours.addresses.push({ ip: (response.answers[2].data as string) + ':' + response.answers[1].data.port, local })

    neighbours.addresses.sort((a, b) => b - a);
})

mdns.on('query', function (query) {
    if (query.questions[0] && query.questions[0].type === 'SRV' && query.questions[0].name === 'DCA') {
        console.log('got a query packet:', query)
        let answers: any = [{
            name: HTTPS_MDNS_SERVICE_NAME,
            type: 'SRV',
            data: {
                port: HTTPS_PORT,
                weight: 0,
                priority: 10,
                target: HTTPS_MDNS_SERVICE_NAME + '.example.com'
            }
        },
        {
            name: HTTP_MDNS_SERVICE_NAME,
            type: 'SRV',
            data: {
                port: HTTP_PORT,
                weight: 0,
                priority: 10,
                target: HTTP_MDNS_SERVICE_NAME + '.example.com'
            }
        }]

        nicAddresses.forEach((address: { nic: string, ip: string, mask: string | null }) => {
            answers.push({
                name: os.hostname() + '.local',
                type: 'A',
                //   ttl: 300,
                data: address.ip
            })
        });
        mdns.respond({ answers })
    }
})

// lets query for an A record for 'brunhilde.local'
mdns.query({
    questions: [{
        name: 'DCA',
        type: 'SRV'
    }]
})

// Constants
const HTTP_PORT: number = parseInt(process.env.HTTP_PORT as string) || 80;
const HTTPS_PORT: number = parseInt(process.env.HTTPS_PORT as string) || 443;
const INFLUX_PORT = 8086;
const HTTP_MDNS_SERVICE_NAME = 'http-my-service'
const HTTPS_MDNS_SERVICE_NAME = 'https-my-service'

var apiProxy = httpProxy.createProxyServer();
var target = 'https://influxdb:' + INFLUX_PORT;


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

app.get('/neighbours', (req: any, res: any) => {
    res.send(JSON.stringify(neighbours))
})

app.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.get("*", function (req: any, res: any) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const httpServer = http.createServer(app);
httpServer.listen(HTTP_PORT, () => {
    console.log('HTTP Server running on port ' + HTTP_PORT);
});

const httpsServer = https.createServer(ssl, app);
httpsServer.listen(HTTPS_PORT, () => {
    console.log('HTTPS Server running on port ' + HTTPS_PORT);
});
