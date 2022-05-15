import fs from 'fs';
import * as Plugin from './plugin'
import * as Events from './events'
import Path from 'path';

export const DEFAULT_CONFIG_PATH = Path.join(__dirname, './default.json');

interface Config {
    [index: string]: any;
}

export interface Options extends Plugin.Options {
    CONFIG_PATH: string;
    default?: Config;
}

export class plugin extends Plugin.Instance {
    options!: Options;
    settings: Config;

    get(target: any, prop: any, receiver: any): number | boolean | string {
        console.log(`Getting ${prop}`);
        return target[prop];
    }

    set(target: any, key: any, value: any, receiver: any) {
        console.log(`Setting ${key}`);
        if (!target[key]) this.createHttpGetter(`/${key}`, this.settings![key]);
        target[key] = value;
        this.saveConfig();
        return true;
    }

    constructor(app: any, options?: Options, name?: string) {
        super(app, options, name);

        if (!this.options.CONFIG_PATH) this.options.CONFIG_PATH = DEFAULT_CONFIG_PATH;

        try {
            this.settings = JSON.parse(fs.readFileSync(this.options.CONFIG_PATH, "utf8"));
        } catch (e: any) {
            // Create default file if no file found
            this.settings = this.options.default || {};
            this.saveConfig()
        }

        if (!this.settings) this.settings = {};

        // Register HTTP endpoints
        const _this = this;
        Object.keys(this.settings).forEach((key: string) => {
            // Setter
            _this.app.registerEndpoint(`/config/${key}`, (req: any, res: any) => {
                if (req.get(key)) {
                    _this.settings![key] = req.get(key);
                    // Reset value to default if no value specified
                    if (!_this.settings![key] && _this.options.default && _this.options.default[key]) _this.settings![key] = _this.options.default[key];

                    res.send(JSON.stringify(this.settings![key]));
                    this.announce(Events.CONFIG_UPDATE + key, this.settings![key]);

                    return this.saveConfig();
                }
            })

            //Getter

            this.app.registerEndpoint(`/config/${key}`, (_req: any, res: any) => { res.send(JSON.stringify(this.settings![key])) })
        })

        this.createHttpGetter(`/config`, this.settings);

        const oldLoad = Plugin.Instance.prototype.load
        Plugin.Instance.prototype.load = function () {
            oldLoad.apply(this);

            // Overwrite **default** values in this.options with those **defaults** found in the config
            this.options = _this.settings && _this.settings[this.name] && { ...this.options, ..._this.settings[this.name].default } || this.options;

            // Overwrite primary values in this.options with those primarys found in the config
            this.options = _this.settings && _this.settings[this.name] && { ...this.options, ..._this.settings[this.name] } || this.options;

            // Create proxy on config for the new plugin
            _this.settings[this.name] = new Proxy(this.options, _this);

            // Point plugins options to the new proxy
            this.options = _this.settings[this.name];
        }
    }

    createHttpGetter = (path: string, value: any) => this.app.registerEndpoint(path, (_req: any, res: any) => {
        return res.send(JSON.stringify(value))
    })
    saveConfig = () => { if (this.settings && Object.keys(this.settings).length > 0) fs.writeFileSync(this.options.CONFIG_PATH, JSON.stringify(this.settings, null, 4)) }
}