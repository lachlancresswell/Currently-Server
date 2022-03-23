import fs from 'fs';
import * as Server from './server'

const privateKey = fs.readFileSync('../cert/server-selfsigned.key', 'utf8');
const certificate = fs.readFileSync('../cert/server-selfsigned.crt', 'utf8');
const ssl = { key: privateKey, cert: certificate };

const server = new Server.Server({
    INFLUX_PORT: Server.INFLUX_PORT,
    CONFIG_PATH: Server.CONFIG_PATH,
    DEFAULT_DEVICE_NAME: Server.DEFAULT_DEVICE_NAME,
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
    HTTP_MDNS_SERVICE_NAME: Server.HTTP_MDNS_SERVICE_NAME,
    HTTPS_MDNS_SERVICE_NAME: Server.HTTPS_MDNS_SERVICE_NAME,
    MDNS_RECORD_TYPE: Server.MDNS_RECORD_TYPE,
    MDNS_DOMAIN: Server.MDNS_DOMAIN,
    SERVICE_NAME: Server.SERVICE_NAME,
    ssl
});

server.start();
server.discoveryLoop(30000);