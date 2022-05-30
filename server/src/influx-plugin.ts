import * as express from 'express';
import * as Plugin from './plugin';
import * as Server from './server'

interface Options extends Plugin.Options {
    INFLUX_PORT?: Plugin.ClientOption<number>,
    INFLUX_DOMAIN?: Plugin.ClientOption<string>,
}

const defaultOptions: Options = {
    INFLUX_PORT: {
        priority: 1, // 0 for not displayed in client page, values starting at 1 for how high it is displayed
        readableName: 'Influx Port', // Human readable name for var
        value: 8086, // actual value
        restart: 'no-restart', // 0 if no restart required, 1 if plugin restart required, 2 if server restart required
    },
    INFLUX_DOMAIN: {
        priority: 1, // 0 for not displayed in client page, values starting at 1 for how high it is displayed
        readableName: 'Influx Port', // Human readable name for var
        value: 'localhost', // actual value
        restart: 'no-restart', // 0 if no restart required, 1 if plugin restart required, 2 if server restart required
    },
}

export class plugin extends Plugin.Instance {
    options!: Options;

    constructor(app: Server.default, options?: Options, name?: string) {
        super(app, options, name, defaultOptions);

        this.app.registerGetRoute("/influx/*", (req, res) => {
            let target = (req.socket as any).encrypted ? 'https://' : 'http://';
            target += this.options.INFLUX_DOMAIN!.value + ':' + this.options.INFLUX_PORT!.value + req.url.substring(req.url.indexOf("x") + 1);
            return this.app.proxy(target, req, res);
        });
    }
}
