import express from 'express';
import cors from 'cors';
import httpProxy from 'http-proxy';
import fs from 'fs';
import http from 'http';
import https from 'https';
import * as NIC from './nic';
import { Mdns, Options } from "./mdns";

// Constants
export const HTTP_PORT: number = parseInt(process.env.HTTP_PORT as string) || 80;
export const HTTPS_PORT: number = parseInt(process.env.HTTPS_PORT as string) || 443;
export const INFLUX_PORT = parseInt(process.env.INFLUX_PORT as string) || 8086;
export const INFLUX_DOMAIN = process.env.INFLUX_DOMAIN as string || 'localhost';
export const HTTP_MDNS_SERVICE_NAME = 'http-my-service'
export const HTTPS_MDNS_SERVICE_NAME = 'https-my-service'
export const MDNS_RECORD_TYPE = 'SRV';
export const MDNS_DOMAIN = '.local';
export const SERVICE_NAME = 'DCA';
export const DEFAULT_DEVICE_NAME = "my-device" + HTTP_PORT
export const CONFIG_PATH = process.env.CONFIG_FILE || './default.json';

interface ServerOptions extends Options {
    CONFIG_PATH: string,
    INFLUX_DOMAIN: string,
    INFLUX_PORT: number,
    DEFAULT_DEVICE_NAME: string,
    ssl?: { key: string, cert: string },
}

interface addressObj {
    ip: string,
    name: string,
    local: boolean,
    modbusIP: string,
}

const formatIPandPort = (response: { answers: any[] }) => (response.answers[2].data as string) + ':' + response.answers[1].data.port;

export class Server {
    MDNS: Mdns;
    app: any;
    nicAddresses: NIC.NicInfo[];
    apiProxy: httpProxy;
    options: ServerOptions;
    config: { Device: { name: string } };
    discover: boolean;
    neighbours: { addresses: addressObj[] } = { addresses: [] };

    constructor(options: ServerOptions) {
        this.options = options;
        this.discover = false;
        try {
            this.config = JSON.parse(fs.readFileSync(this.options.CONFIG_PATH, "utf8"));
        } catch (e: any) {
            this.config = { Device: { name: this.options.DEFAULT_DEVICE_NAME } }
            this.saveConfig()
        }

        this.MDNS = new Mdns(options);

        this.nicAddresses = NIC.getAddresses()!;

        this.app = express();
        this.app.use(cors({
            'allowedHeaders': ['Content-Type'],
            'origin': '*',
            'preflightContinue': true
        }));

        this.app.use(express.static('../client/dist/'));

        /**
         * Proxy /influx requests to influx server via HTTPS
         */
        this.app.all("/influx/*", (req: express.Request, res: any) => {
            let target = this.options.ssl ? 'https://' : 'http://';
            target += INFLUX_DOMAIN + ':' + this.options.INFLUX_PORT + req.url.substring(req.url.indexOf("x") + 1);
            console.log('Proxying to influx - ' + target.substring(0, 30))
            this.apiProxy.web(req, res, {
                ssl: this.options.ssl ? this.options.ssl : undefined,
                target,
                secure: false // Prevents errors with self-signed certß
            }, (e: Error) => {
                console.log(e)
                res.send('Error: Influx server connection refused');
            });
        });

        /**
         * Neighbouring server API endpoint
         */
        this.app.get('/neighbours', (req: any, res: any) => {
            res.send(JSON.stringify(this.neighbours))
        })

        this.app.post('/device-name/*', (req: express.Request, res: any) => {
            this.config.Device.name = req.get("device-name")!;
            if (!this.config.Device.name) this.config.Device.name = this.options.DEFAULT_DEVICE_NAME;
            res.send(JSON.stringify(this.config.Device.name));
            this.MDNS.sendUpdate(this.nicAddresses.map(a => a.ip), this.options.DEFAULT_DEVICE_NAME, process.env.MODBUS_GATEWAY_IP);
            this.neighbours.addresses.find((n) => n.local)!.name = this.config.Device.name;
            this.saveConfig();
        })

        this.app.get('/device-name/*', (req: any, res: any) => {
            res.send(JSON.stringify(this.config.Device.name))
        })

        this.MDNS.attachResponseHandler((response: any) => {
            if ((response.answers[0].name === this.options.HTTP_MDNS_SERVICE_NAME || response.answers[0].name === this.options.HTTPS_MDNS_SERVICE_NAME)) {

                const incomingIP = formatIPandPort(response)
                let name = response.answers[2].name;
                const modbusIP = response.answers[response.answers.length - 1].data;
                const domainLoc = name.indexOf('.local');
                if (domainLoc) name = name.substring(0, domainLoc)
                // Find if response is a loopback e.g the local device
                let local = this.nicAddresses.some((address: { name: string, ip: string, mask: string | null }) => (address.ip === response.answers[2].data && this.config.Device.name === name && (response.answers[0].data.port === this.options.HTTP_PORT || response.answers[1].data.port.toString === this.options.HTTPS_PORT)));

                console.log('Response from - ' + incomingIP)

                // Check if incoming address is new or not
                if ((!this.neighbours.addresses.filter((address: addressObj) => (address.ip === incomingIP && address.local === local)).length)) {

                    this.neighbours.addresses.push({ ip: incomingIP, name, local, modbusIP: (modbusIP === '0.0.0.0') ? '' : modbusIP })
                    const uri = incomingIP.replace(':', '/');

                    /**
                     * External influx proxy
                     */
                    this.app.all(`/${uri}/*`, (req: any, res: any) => {
                        const target = "https://" + (req.url.substring(req.url.indexOf("/") + 1).replace("/", ':'));
                        console.log('Proxying to external influx - ' + target.substring(0, 30) + '...')
                        this.apiProxy.web(req, res, {
                            ssl: this.options.ssl,
                            target,
                            secure: false // Prevents errors with self-signed certß
                        }, (e: Error) => console.log(e));
                    });
                }

                this.neighbours.addresses.sort((a, b) => a.local ? 1 : 0);
            }
        })


        this.apiProxy = httpProxy.createProxyServer();

        this.MDNS.attachQueryHandler(() => this.MDNS.sendUpdate(this.nicAddresses.map(a => a.ip), this.config.Device.name, process.env.MODBUS_GATEWAY_IP))
    }

    start = () => {
        this.discoveryLoop(30000);

        const httpServer = http.createServer(this.app);
        httpServer.listen(this.options.HTTP_PORT, () => console.log('HTTP Server running on port ' + this.options.HTTP_PORT));

        if (this.options.ssl) {
            const httpsServer = https.createServer(this.options.ssl, this.app);
            httpsServer.listen(this.options.HTTPS_PORT, () => console.log('HTTPS Server running on port ' + this.options.HTTPS_PORT));
        }
    }

    /**
     * Perform mdns query every ms milliseconds
     * @param ms How often to check in ms
     */
    discoveryLoop = (ms: number) => {
        this.discover = true;
        this.neighbours = { addresses: [] };

        this.MDNS.sendQuery()
        setTimeout(() => {
            if (this.discover) this.discoveryLoop(ms);
        }, ms)
    }

    endDiscoveryLoop = () => this.discover = false;

    saveConfig = () => fs.writeFile(this.options.CONFIG_PATH, JSON.stringify(this.config), () => { });
}