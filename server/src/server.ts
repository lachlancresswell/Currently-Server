import express from 'express';
import cors from 'cors';
import httpProxy from 'http-proxy';
import http from 'http';
import https from 'https';
import * as path from 'path';
import * as PluginLoader from './plugin-loader'

// Constants
export const HTTP_PORT: number = parseInt(process.env.HTTP_PORT as string) || 80;
export const HTTPS_PORT: number = parseInt(process.env.HTTPS_PORT as string) || 443;

export interface Options {
    HTTP_PORT: number,
    HTTPS_PORT?: number,
    ssl?: { key: string, cert: string },
}

export const defaultOptions: Options = {
    HTTP_PORT: 80,
}

export default class Server {
    app: any;
    apiProxy: httpProxy;
    options: Options;
    config: any;
    httpServer?: http.Server;
    httpsServer?: https.Server;
    plugins?: PluginLoader.PluginConfig[];

    constructor(options?: Options) {
        this.options = { ...defaultOptions, ...options };

        if (process.env.HTTP_PORT) this.options.HTTP_PORT = parseInt(process.env.HTTP_PORT as string)
        if (process.env.HTTPS_PORT) this.options.HTTPS_PORT = parseInt(process.env.HTTPS_PORT as string)
        if (process.env.SSL_KEY && process.env.SSL_CERT) {
            this.options.ssl = { key: process.env.SSL_KEY, cert: process.env.SSL_CERT };
        }

        this.app = express();
        this.app.use(cors({
            'allowedHeaders': ['Content-Type'],
            'origin': '*',
            'preflightContinue': true
        }));
        this.app.use(express.static('../client/dist/'));

        this.apiProxy = httpProxy.createProxyServer();
    }

    start = async () => {

        this.httpServer = http.createServer(this.app);
        this.httpServer.listen(this.options.HTTP_PORT, () => console.log('HTTP Server running on port ' + this.options.HTTP_PORT));

        if (this.options.ssl) {
            this.httpsServer = https.createServer(this.options.ssl, this.app);
            this.httpsServer.listen(this.options.HTTPS_PORT, () => console.log('HTTPS Server running on port ' + this.options.HTTPS_PORT));
        }
        this.plugins = await PluginLoader.loadFromConfig(this, path.resolve(__dirname, '../plugins.json'));
    }

    end = () => {
        PluginLoader.unload(this.plugins!);
        if (this.httpServer) this.httpServer.close();
        if (this.httpsServer) this.httpsServer.close();
        if (this.apiProxy) this.apiProxy.close();
    }

    registerEndpoint = (path: string, cb: any) => this.app.all(`${path}`, cb);
    proxy = (target: string, req: any, res: any) => this.apiProxy.web(req, res, {
        ssl: this.options.ssl,
        target,
        secure: false // Prevents errors with self-signed certß
    }, (e: Error) => console.log(e));
}