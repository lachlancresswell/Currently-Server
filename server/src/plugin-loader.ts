import fs from "fs";
import * as Plugin from './plugin'

export interface PluginConfig {
    name: string;
    enabled: boolean;
    path: string;
    module?: Plugin.Instance;
    loaded: boolean;
    options: any;
}

export const loadFromConfig = async (app: any, path = './plugins.json') => {
    const plugins: PluginConfig[] = JSON.parse(fs.readFileSync(path).toString()).plugins;
    plugins.forEach(async (plug: PluginConfig) => {
        if (plug.enabled) {
            await load(app, plug);
        }
    });

    return plugins;
}

export const loadConfig = (path = './plugins.json'): PluginConfig[] | void => {
    if (!fs.existsSync(path)) throw Error(`File does not exist`);
    const contents = JSON.parse(fs.readFileSync(path).toString());
    if (!contents.plugins) throw Error(`'plugins' key missing`)
    return contents.plugins;
};

export const load = (app: any, plugin: PluginConfig): Promise<PluginConfig | Error> => new Promise(async (res, rej) => {
    const path = plugin.path;
    try {
        const module = require(path);
        const obj = new module.plugin(app, plugin.options, plugin.name);
        await obj.load();
        plugin.module = obj;
        console.log(`Loaded plugin: '${plugin.name}'`);
        plugin.loaded = true;
        return res(plugin)
    } catch (e) {
        console.log(`Failed to load '${plugin.name}'`)
        plugin.loaded = false;
        return rej(e)
    }
});

export const reload = async (app: any, plugin: PluginConfig) => {
    await plugin.module!.unload()//.then(async (res) => res(await ))
    plugin.module = undefined;
    return load(app, plugin)
};

export const unload = (plugins: PluginConfig[]) => {
    let proms: Promise<any>[] = [];
    plugins.forEach(async (plug: PluginConfig) => {
        await plug.module!.unload();
        plug.module = undefined;
        // proms.push(p);
        plug.loaded = false;
    })

    //return Promise.all(proms)
}