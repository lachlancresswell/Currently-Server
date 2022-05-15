import * as PluginLoader from '../plugin-loader';
import * as Server from '../server'
import Path from 'path'
import fs from 'fs';
import * as Mdns from '../mdns-plugin';

jest.mock("../server");
const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});

const randomString = () => (Math.random() + 1).toString(36).substring(7);

describe('Loading plugins', () => {
    let plugins: PluginLoader.PluginConfig[] | null;

    afterEach(async () => {
        await PluginLoader.unload(plugins!);
        plugins = null;
    });

    test('load plugins and set global config', async () => {
        expect.assertions(6)
        const key = randomString();
        const badConfig: any = {};
        badConfig[key] = randomString()
        const globalConfigPath = Path.join(__dirname, `./${randomString()}.json`)
        const contents = {
            plugins: [
                {
                    "name": "config",
                    "path": "../dist/config-plugin.js",
                    "enabled": true,
                    "options": {
                        "CONFIG_PATH": globalConfigPath,
                        "DEFAULT_DEVICE_NAME": "my-distro"
                    }
                },
                {
                    "name": "mdns",
                    "path": "../dist/mdns-plugin.js",
                    "enabled": true,
                    "options": {
                        "HTTP_PORT": 8080,
                        "HTTPS_PORT": 8081,
                        "MDNS_DOMAIN": ".local",
                        "HTTP_MDNS_SERVICE_NAME": "http-my-service",
                        "HTTPS_MDNS_SERVICE_NAME": "https-my-service",
                        "SERVICE_NAME": "my-service",
                        "MDNS_RECORD_TYPE": "SRV",
                        "ms": 20000,
                        "discover": true,
                        "advertise": true,
                        "name": "hellooo!"
                    }
                }
            ]
        }
        const pluginConfigPath = Path.join(__dirname, `./${randomString()}.json`)
        fs.writeFileSync(pluginConfigPath, JSON.stringify(contents))
        fs.writeFileSync(globalConfigPath, JSON.stringify(badConfig))
        expect(fs.existsSync(pluginConfigPath)).toBeTruthy();
        expect(fs.existsSync(globalConfigPath)).toBeTruthy();

        plugins = await PluginLoader.loadFromConfig(server, pluginConfigPath);
        const mdnsPlugin = plugins.find(p => p.name === contents.plugins[1].name)
        const configPlugin: any = plugins.find(p => p.name === contents.plugins[0].name)
        expect(mdnsPlugin?.module.options.name).toEqual(contents.plugins[1].options.name)
        expect(configPlugin?.module.settings.name).toEqual(contents.plugins[1].options.name)

        fs.unlinkSync(pluginConfigPath);
        fs.unlinkSync(globalConfigPath);
        expect(fs.existsSync(pluginConfigPath)).toBeFalsy();
        expect(fs.existsSync(globalConfigPath)).toBeFalsy();
    });

    test('existing values in config file should be used + not overridden', async () => {
        expect.assertions(6)

        const badConfig: any = {
            'device_name': randomString()
        };
        const globalConfigPath = Path.join(__dirname, `./${randomString()}.json`)
        const contents = {
            plugins: [
                {
                    "name": "config",
                    "path": "../dist/config-plugin.js",
                    "enabled": true,
                    "options": {
                        "CONFIG_PATH": globalConfigPath,
                        "DEFAULT_DEVICE_NAME": "my-distro"
                    }
                },
                {
                    "name": "mdns",
                    "path": "../dist/mdns-plugin.js",
                    "enabled": true,
                    "options": {
                        "HTTP_PORT": 8080,
                        "HTTPS_PORT": 8081,
                        "MDNS_DOMAIN": ".local",
                        "HTTP_MDNS_SERVICE_NAME": "http-my-service",
                        "HTTPS_MDNS_SERVICE_NAME": "https-my-service",
                        "SERVICE_NAME": "my-service",
                        "MDNS_RECORD_TYPE": "SRV",
                        "ms": 20000,
                        "discover": true,
                        "advertise": true,
                        "name": "hellooo!"
                    }
                }
            ]
        }
        const pluginConfigPath = Path.join(__dirname, `./${randomString()}.json`)
        fs.writeFileSync(pluginConfigPath, JSON.stringify(contents))
        fs.writeFileSync(globalConfigPath, JSON.stringify(badConfig))
        expect(fs.existsSync(pluginConfigPath)).toBeTruthy();
        expect(fs.existsSync(globalConfigPath)).toBeTruthy();

        plugins = await PluginLoader.loadFromConfig(server, pluginConfigPath);
        const mdnsPlugin = plugins.find(p => p.name === contents.plugins[1].name)
        const configPlugin: any = plugins.find(p => p.name === contents.plugins[0].name)
        expect(mdnsPlugin?.module.options.device_name).toEqual(badConfig.device_name)
        expect(configPlugin?.module.settings.device_name).toEqual(badConfig.device_name)

        fs.unlinkSync(pluginConfigPath);
        fs.unlinkSync(globalConfigPath);
        expect(fs.existsSync(pluginConfigPath)).toBeFalsy();
        expect(fs.existsSync(globalConfigPath)).toBeFalsy();

    });
});