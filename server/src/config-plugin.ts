import fs from 'fs';
import * as Plugin from './plugin'
import * as Events from './events'
import Path from 'path';
import * as Server from './server'
import * as PluginLoader from './plugin-loader'

export const DEFAULT_CONFIG_PATH = Path.join(__dirname, '../default.json');

interface Config {
    [index: string]: any;
}

export interface Options extends Plugin.Options {
    CONFIG_PATH: string;
    default?: any;//Config;
}

const defaultOptions: Options = {
    CONFIG_PATH: DEFAULT_CONFIG_PATH
}

export class plugin extends Plugin.Instance {
    options!: Options;
    settings: Config;

    get<Type>(target: { [index: string]: Type }, prop: string): Type {
        // console.log(`Getting ${prop}`);
        return target[prop];
    }

    set<Type>(target: { [index: string]: Type }, key: string, value: Type) {
        console.log(`Setting ${key}  to ${value}`);
        if (!target[key]) this.createHttpGetter(`/${key}`, this.settings![key]);
        target[key] = value;
        this.saveConfig();
        return true;
    }

    constructor(app: Server.default, options?: Options, name?: string) {
        super(app, options, name, defaultOptions);

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
        // Setter
        _this.app.registerPostRoute(`/config/:key`, (req, res) => {
            const key = req.params.key;
            _this.settings[key] = { ...this.settings[key], ...req.body }
            // Reset value to default if no value specified
            //if (!_this.settings![key] && _this.options.default && _this.options.default[key]) _this.settings![key] = _this.options.default[key];

            res.send(JSON.stringify(this.settings[key]));
            this.announce(Events.CONFIG_UPDATE + key, this.settings[key]);

            return this.saveConfig();
        })

        //Getter

        this.app.registerGetRoute(`/config/:key`, (_req, res) => { res.send(JSON.stringify(this.settings[_req.params.key])) })

        this.createHttpGetter(`/config`, this.settings);
        this.app.registerPostRoute('/config', (req, res) => {

            const changed = false;
            const recurse = (curConf: Config, newConf: { [index: string]: any; }, keys?: { pluginTitle: string, restart?: Plugin.RestartOption }) => {
                Object.keys(curConf).forEach(async k => {
                    let set = false;
                    if (typeof curConf[k] === 'object') {
                        if (!keys) {
                            keys = { pluginTitle: k, restart: undefined };
                            set = true;
                        }
                        recurse(curConf[k], newConf[k], keys)
                        if (keys) {
                            if (keys.restart && set) {
                                if (keys.restart === 'restart-plugin') {
                                    const i = _this.app.plugins?.findIndex((plug) => plug.name === keys?.pluginTitle)
                                    await PluginLoader.reload(_this.app, _this.app.plugins![i!])
                                }
                            }
                            if (set) keys = undefined;
                        }
                    } else {
                        if (curConf[k] !== newConf[k]) {
                            if (typeof curConf[k] == 'boolean' && typeof newConf[k] != 'boolean') {
                                if (newConf[k] === 'on') newConf[k] = false;
                                else if (newConf[k] === 'off') newConf[k] = true;
                            }
                            curConf[k] = newConf[k];
                            if (curConf['restart']) keys!.restart = curConf['restart'];
                        }
                    }

                });
            }

            const key = Object.keys(req.body)[0];

            recurse(_this.settings[key], req.body[key])

            // _this.settings = { ...this.settings, ...req.body }
            _this.announce(Events.CONFIG_UPDATE, this.settings!);

            res.send()

            return this.saveConfig();
        })

        const oldLoad = Plugin.Instance.prototype.load
        Plugin.Instance.prototype.load = function () {
            // Overwrite **default** values in this.options with those **defaults** found in the config
            this.options = _this.settings && _this.settings[this.name] && { ...this.options, ..._this.settings[this.name].default } || this.options;

            // Overwrite primary values in this.options with those primarys found in the config
            this.options = _this.settings && _this.settings[this.name] && { ...this.options, ..._this.settings[this.name] } || this.options;

            Object.keys(this.options).forEach((k) => {
                if (typeof this.options[k] === 'object') {
                    this.options[k] = new Proxy(this.options[k] as Plugin.ClientOption<any>, _this)
                }
            })
            // Create proxy on config for the new plugin
            _this.settings[this.name] = new Proxy(this.options, _this);

            // Point plugins options to the new proxy
            this.options = _this.settings[this.name];

            _this.saveConfig();

            oldLoad.apply(this);
        }
    }

    createHttpGetter = <Type>(path: string, value: Type) => this.app.registerGetRoute(path, (_req, res) => res.send(JSON.stringify(value)))
    saveConfig = () => { if (this.settings && Object.keys(this.settings).length > 0) fs.writeFileSync(this.options.CONFIG_PATH, JSON.stringify(this.settings, null, 4)) }
}