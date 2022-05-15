import fs from 'fs';
import * as Plugin from './plugin'
import * as Events from './events'

export const DEFAULT_CONFIG_PATH = './default.json';

interface Config {
    [index: string]: string;
}

export interface Options extends Plugin.Options {
    CONFIG_PATH: string;
    default?: Config;
}

export class plugin extends Plugin.Instance {
    options!: Options;
    config?: Config;
    settings?: any;

    get(target: any, prop: any, receiver: any): number | boolean | string {
        console.log(`Getting ${prop}`);
        return target[prop];
    }

    set(target: any, key: any, value: any, receiver: any) {
        console.log(`Setting ${key}`);
        if (!this.settings![key]) this.createHttpGetter(`/${key}`, this.config![key]);
        this.config![key] = value;
        this.saveConfig();
        return target[key] = value
    }

    constructor(app: any, options?: Options) {
        super(app, options);

        if (!this.options.CONFIG_PATH) this.options.CONFIG_PATH = DEFAULT_CONFIG_PATH;

        try {
            this.config = JSON.parse(fs.readFileSync(this.options.CONFIG_PATH, "utf8"));
        } catch (e: any) {
            // Create default file if no file found
            if (this.options.default) this.config = this.options.default;
            this.saveConfig()
        }

        if (!this.config) this.config = {};
        this.app.config = this;

        //(Plugin.Instance.prototype as any).config = this.config

        this.settings = new Proxy(this.config, this);

        // Register HTTP endpoints
        const _this = this;
        Object.keys(this.config).forEach((key: string) => {
            // Setter
            _this.app.registerEndpoint(`/config/${key}`, (req: any, res: any) => {
                if (req.get(key)) {
                    _this.config![key] = req.get(key);
                    // Reset value to default if no value specified
                    if (!_this.config![key] && _this.options.default && _this.options.default[key]) _this.config![key] = _this.options.default[key];

                    res.send(JSON.stringify(this.config![key]));
                    this.announce(Events.CONFIG_UPDATE + key, this.config![key]);

                    return this.saveConfig();
                }
            })

            //Getter

            this.app.registerEndpoint(`/config/${key}`, (_req: any, res: any) => { res.send(JSON.stringify(this.config![key])) })
        })

        this.createHttpGetter(`/config`, this.config);

        const oldLoad = Plugin.Instance.prototype.load
        Plugin.Instance.prototype.load = function () {
            oldLoad.apply(this);
            Object.assign(this.options, _this.settings);
            Object.assign(_this.settings, this.options);
            this.options = _this.settings;
        }
    }

    createHttpGetter = (path: string, value: any) => this.app.registerEndpoint(path, (_req: any, res: any) => {
        return res.send(JSON.stringify(value))
    })
    saveConfig = () => { if (this.config) fs.writeFileSync(this.options.CONFIG_PATH, JSON.stringify(this.config, null, 4)) }
}