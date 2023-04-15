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
    loadFromPath(pluginPath: string) {
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
