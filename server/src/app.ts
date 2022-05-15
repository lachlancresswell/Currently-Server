import dotenv from "dotenv"
dotenv.config({ path: __dirname + '/../.env' })
import fs from 'fs';
import * as Server from './server'

const privateKey = fs.readFileSync('../cert/server-selfsigned.key', 'utf8');
const certificate = fs.readFileSync('../cert/server-selfsigned.crt', 'utf8');
const ssl = { key: privateKey, cert: certificate };

const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
    ssl
});

server.start();
