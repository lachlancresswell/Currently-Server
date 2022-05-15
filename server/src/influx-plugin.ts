import * as express from 'express';
import * as Plugin from './plugin';

interface Options extends Plugin.Options {
    INFLUX_PORT?: number,
    INFLUX_DOMAIN?: string,
}

export class plugin extends Plugin.Instance {
    options!: Options;

    constructor(app: any, options?: Options) {
        super(app);

        if (!this.options.INFLUX_PORT) this.options.INFLUX_PORT = 8086;
        if (!this.options.INFLUX_DOMAIN) this.options.INFLUX_DOMAIN = 'localhost';

        this.app.registerEndpoint("/influx/*", (req: express.Request, res: any) => {
            let target = this.app.options.ssl ? 'https://' : 'http://';
            target += this.options.INFLUX_DOMAIN + ':' + this.options.INFLUX_PORT + req.url.substring(req.url.indexOf("x") + 1);
            return this.app.proxy(target, req, res);
        });
    }
}
