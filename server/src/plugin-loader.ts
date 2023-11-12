import { Plugin } from './plugin';
import * as fs from 'fs';
import * as path from 'path';
import { Routing } from './server'
import { PluginConfig, ConfigArray, PluginJSON, EphemeralVariableMetaData, ConfigValue } from '../../Types';

/**
 * Plugin Loader class.
 */
export class PluginLoader {
    protected plugins: Plugin<any>[] = [];
    protected pluginConfigs: Record<string, PluginConfig> = {};
    private app: Routing;

    constructor(private configFilePath: string, app: Routing) {
        this.app = app;
        this.loadConfigs();
        this.initRoutes();
    }

    /**
     * Initializes routes for the plugin configuration API.
     */
    private initRoutes = () => {
        const _this = this;
        this.app.registerGetRoute('/config', (req, res) => {
            res.json(this.pluginConfigs);
        });

        this.app.registerGetRoute('/config/:plugin', (req, res) => {
            const pluginName = req.params.plugin;
            const plugin = this.plugins.find((plug) => plug.name === pluginName);
            if (plugin && plugin.configuration) {
                res.json(plugin.configuration);
            } else {
                res.status(404).json({ error: 'Plugin not found' });
            }
        });

        this.app.registerPutRoute('/config/:plugin', (req, res) => {
            const pluginName = req.params.plugin;
            const newConfig: ConfigArray = req.body;
            const plugin = _this.plugins.find((plug) => plug.name === pluginName);

            if (plugin) {
                const restart = plugin.updateEntireConfig(newConfig);
                res.status(200).json(_this.pluginConfigs[pluginName].config);
                if (restart === 'plugin') {
                    plugin.restart();
                } else if (restart === 'server') {
                    // TODO
                }
            } else {
                res.status(404).json({ error: `Plugin ${pluginName} not found` });
            }
        });
    }

    /**
     * Loads the plugin configurations from a JSON file.
     */
    private loadConfigs(): Record<string, PluginConfig> | undefined {
        const p = path.join(__dirname, this.configFilePath)
        console.log(`Loading config from ${p}`)
        if (fs.existsSync(p)) {
            const configFileContent = fs.readFileSync(p).toString();

            this.pluginConfigs = JSON.parse(configFileContent) as PluginJSON;

            // Create 'key' item for each plugin config variable
            const pluginNames = Object.keys(this.pluginConfigs);
            for (const pluginName of pluginNames) {
                const pluginConfig = this.pluginConfigs[pluginName];
                if (pluginConfig.config) {
                    const keys = Object.keys(pluginConfig.config);
                    for (const key of keys) {
                        const variable = pluginConfig.config[key];
                        variable.key = key;
                    }
                }
            }

            return this.pluginConfigs;
        } else {
            console.log(`Config does not exist: ${p}`)
            // TODO: throw error? throwing error causes tests to fail
            return undefined;
        }
    }

    /**
     * Loads a specific plugin configurations from a JSON file.
     */
    private loadConfig(pluginName: string) {
        const p = path.join(__dirname, this.configFilePath)
        console.log(`Loading config from ${p}`)
        try {
            const configFileContent = fs.readFileSync(p).toString();

            const pluginConfigs = JSON.parse(configFileContent) as PluginJSON;

            return pluginConfigs[pluginName]
        } catch (e) {
            throw (e)
        }
    }

    /**
    * Saves the plugin configurations to a JSON file while skipping the value property of EphemeralVariableMetaData variables.
    */
    private saveConfigs(): void {

        // Ephermeral values have a toJSON method, so we can skip them
        function replacer(this: any, key: string, value: any) {
            if (key === 'value' && !!(this as unknown as EphemeralVariableMetaData<ConfigValue>).toJSON) {
                return undefined;
            }

            // Don't save generated 'key' item to disk
            if (key === 'key') {
                return undefined;
            }
            return value;
        };

        const configFileContent = JSON.stringify(this.pluginConfigs, replacer, 2);
        if (configFileContent === '{}') {
            console.log(`Plugin config is empty, skipping save.`);
            return;
        }
        const p = path.join(__dirname, this.configFilePath);
        fs.writeFileSync(p, configFileContent, 'utf8');
        console.log(`Config written to ${p}`)
    }

    /**
     * Loads all enabled plugins.
     */
    public loadPlugins(): void {
        for (const pluginName in this.pluginConfigs) {
            const pluginConfig = this.pluginConfigs[pluginName];
            if (pluginConfig.enabled) {
                this.loadPlugin(pluginName, pluginConfig)
            }
        }
    }

    /**
     * Loads a plugin with the given configuration.
     * @param pluginName - The name of the plugin.
     * @param pluginConfig - The plugin configuration.
     */
    protected loadPlugin(pluginName: string, pluginConfig: PluginConfig): Boolean {
        try {
            const PluginClass = PluginLoader.loadFromPath(pluginConfig.path);

            const plugin = new PluginClass(this.app, pluginConfig.config) as Plugin<ConfigArray>;


            // Listen for the configUpdated event
            plugin.on('configUpdated', (key: string, _value: any) => {
                this.pluginConfigs[pluginName].config![key] = plugin.configuration[key];
                this.saveConfigs();
            });

            plugin.load();
            this.plugins.push(plugin);

            console.log(`Loaded ${pluginName}`);

            return true;
        } catch (error: any) {
            console.error(`Failed to load plugin "${pluginName}": ${error.message}`);

            return false;
        }
    }

    /**
     * Reloads a plugin with the given name.
     * @param pluginName - The name of the plugin.
     */
    public reloadPlugin(pluginName: string): boolean {
        const pluginIndex = this.plugins.findIndex((plug) => plug.name === pluginName);
        if (pluginIndex !== -1) {
            const plugin = this.plugins[pluginIndex];

            plugin.unload();
            this.pluginConfigs[pluginName] = this.loadConfig(pluginName);
            const pluginConfig = this.pluginConfigs[pluginName];

            const result = this.loadPlugin(pluginName, pluginConfig);
            if (result) {
                this.plugins.splice(pluginIndex, 1, plugin);
                return true;
            }
        }
        return false;
    }

    /**
     * Expanded here to allow overriding for tests
     */
    static loadFromPath(pluginPath: string) {
        const p = path.join(__dirname + '/__tests__', pluginPath);
        const PluginClass = require(p).default;

        return PluginClass;
    }

    /**
     * Unloads all loaded plugins.
     */
    public unloadPlugins(): void {
        for (const plugin of this.plugins) {
            plugin.unload();
        }
        this.plugins = [];
    }
}
