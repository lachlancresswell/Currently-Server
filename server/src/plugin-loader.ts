import { Plugin } from './plugin';
import * as fs from 'fs';
import * as path from 'path';
import { Routing } from './server'
import { PluginConfig } from '../../Types';

/**
 * Plugin Loader class.
 */
export class PluginLoader {
    protected plugins: Plugin<any>[] = [];
    private pluginConfigs: Record<string, PluginConfig> = {};
    private app: Routing;

    constructor(private configFilePath: string, app: Routing) {
        this.app = app;
        this.loadConfigs();
        this.initRoutes();
    }

    /**
     * Updates the configuration of a specific plugin.
     * @param pluginName - The name of the plugin.
     * @param newConfig - The new configuration object for the plugin.
     */
    private updatePluginConfig(pluginName: string, newConfig: object): void {
        if (this.pluginConfigs[pluginName]) {
            this.pluginConfigs[pluginName].config = { ...this.pluginConfigs[pluginName].config, ...newConfig };
            this.saveConfigs();
        }
    }

    /**
     * Updates the configurations of all plugins.
     * @param newConfigs - The new configurations object for all plugins.
     */
    private updateAllPluginConfigs(newConfigs: Record<string, PluginConfig>): void {
        for (const pluginName in newConfigs) {
            if (this.pluginConfigs[pluginName]) {
                this.updatePluginConfig(pluginName, newConfigs[pluginName].config);
            }
        }
    }


    /**
     * Initializes routes for the plugin configuration API.
     */
    private initRoutes(): void {
        this.app.registerGetRoute('/config', (req, res) => {
            res.json(this.pluginConfigs);
        });

        this.app.registerGetRoute('/config/:plugin', (req, res) => {
            const pluginName = req.params.plugin;
            if (this.pluginConfigs[pluginName]) {
                res.json(this.pluginConfigs[pluginName].config);
            } else {
                res.status(404).json({ error: 'Plugin not found' });
            }
        });

        this.app.registerPostRoute('/config', (req, res) => {
            const newConfigs = req.body;
            this.updateAllPluginConfigs(newConfigs);
            res.status(200).json({ message: 'Configurations updated successfully' });
        });

        this.app.registerPostRoute('/config/:plugin', (req, res) => {
            const pluginName = req.params.plugin;
            const newConfig = req.body;
            if (this.pluginConfigs[pluginName]) {
                this.updatePluginConfig(pluginName, newConfig);
                res.status(200).json({ message: 'Plugin configuration updated successfully' });
            } else {
                res.status(404).json({ error: 'Plugin not found' });
            }
        });
    }

    /**
     * Loads the plugin configurations from a JSON file.
     */
    private loadConfigs(): void {
        const p = path.join(__dirname, this.configFilePath)
        if (fs.existsSync(p)) {
            const configFileContent = fs.readFileSync(p).toString();
            this.pluginConfigs = JSON.parse(configFileContent);
        } else {
            console.log(`Config does not exist: ${p}`)
        }
    }

    /**
     * Saves the plugin configurations to a JSON file.
     */
    private saveConfigs(): void {
        const configFileContent = JSON.stringify(this.pluginConfigs, null, 2);
        fs.writeFileSync(this.configFilePath, configFileContent, 'utf8');
    }

    /**
     * Loads all enabled plugins.
     */
    public loadPlugins(): void {
        for (const pluginName in this.pluginConfigs) {
            const pluginConfig = this.pluginConfigs[pluginName];
            if (pluginConfig.enabled) {
                this.loadPlugin(pluginName, pluginConfig);
                console.log(`Loaded ${pluginName}`)
            }
        }
    }

    /**
     * Loads a plugin with the given configuration.
     * @param pluginName - The name of the plugin.
     * @param pluginConfig - The plugin configuration.
     */
    protected loadPlugin(pluginName: string, pluginConfig: PluginConfig): void {
        try {
            const PluginClass = this.loadFromPath(pluginConfig.path);

            const plugin = new PluginClass(this.app, pluginConfig.config) as Plugin<any>;


            // Listen for the configUpdated event
            plugin.on('configUpdated', (key: string, _value: any) => {
                pluginConfig.config[key] = plugin.configuration[key];
                this.saveConfigs();
            });

            plugin.load();
            this.plugins.push(plugin);
        } catch (error: any) {
            console.error(`Failed to load plugin "${pluginName}": ${error.message}`);
        }
    }

    /**
     * Expanded here to allow overriding for tests
     */
    static loadFromPath(pluginPath: string) {
        const PluginClass = require(path.join(__dirname + '/__tests__', pluginPath)).default;

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
