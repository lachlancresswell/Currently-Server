import { mocked } from 'ts-jest/utils';
import * as DeviceName from '../devicename-plugin';
import Path from 'path'
import fs from 'fs';
import * as PluginLoader from '../plugin-loader';
import * as Server from '../server'

const ConfigPlugin = require('../../dist/config-plugin');
const MdnsPlugin = require('../../dist/mdns-plugin');

jest.mock("../server");

const mockLoad = jest.fn();
jest.mock("../../dist/config-plugin", () => {
    return {
        plugin: jest.fn().mockImplementation(() => {
            return {
                load: mockLoad
            }
        })
    }
});

jest.mock("../../dist/mdns-plugin", () => {
    return {
        plugin: jest.fn().mockImplementation(() => {
            return {
                load: mockLoad
            }
        })
    }
});


const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});


const randomString = () => (Math.random() + 1).toString(36).substring(7);

// beforeEach(() => {
//     jest.resetAllMocks();
// });

describe('loadConfig method', () => {
    test('Should fail to load missing file', async () => {
        expect.assertions(1)
        expect(() => PluginLoader.loadConfig(randomString())).toThrowError(`File does not exist`);
    });

    test('Should fail to load JSON file without "plugins" key', async () => {
        expect.assertions(3)
        const key = randomString();
        const contents: any = {}
        contents[key] = randomString();
        const path = Path.join(__dirname, `./${randomString()}.json`)
        fs.writeFileSync(path, JSON.stringify(contents))
        expect(fs.existsSync(path)).toBeTruthy();
        expect(() => PluginLoader.loadConfig(path)).toThrowError(`'plugins' key missing`);
        fs.unlinkSync(path);
        expect(fs.existsSync(path)).toBeFalsy();
    });

    test('Should load empty config from disk', async () => {
        expect.assertions(3)
        const contents = { plugins: {} }
        const path = Path.join(__dirname, `./${randomString()}.js`)
        fs.writeFileSync(path, JSON.stringify(contents))
        const pluginConfig = PluginLoader.loadConfig(path);
        expect(fs.existsSync(path)).toBeTruthy();
        expect(pluginConfig).toEqual(contents.plugins);
        fs.unlinkSync(path);
        expect(fs.existsSync(path)).toBeFalsy();
    });
});

describe('load method', () => {
    test('should throw when loading non-existing plugin', async () => {
        // Jest fails on require loading a non-existant file
    });

    test('should load existing plugin', async () => {
        expect.assertions(5)
        const contents = {
            plugins: [
                {
                    "name": "config",
                    "path": "../dist/config-plugin.js",
                    "enabled": true,
                    "options": {
                        "CONFIG_PATH": "./default.json",
                        "DEFAULT_DEVICE_NAME": "my-distro"
                    }
                }
            ]
        }
        const path = Path.join(__dirname, `./${randomString()}.js`)
        fs.writeFileSync(path, JSON.stringify(contents))
        expect(fs.existsSync(path)).toBeTruthy();

        const pluginConfig = PluginLoader.loadConfig(path) as PluginLoader.PluginConfig[];
        const ret: PluginLoader.PluginConfig = (await PluginLoader.load(server, pluginConfig[0]) as PluginLoader.PluginConfig)
        expect(ret.module).toBeTruthy();
        expect(ConfigPlugin.plugin).toHaveBeenCalled();
        expect(mockLoad).toHaveBeenCalled();

        fs.unlinkSync(path)
        expect(fs.existsSync(path)).toBeFalsy();
    });
});


describe('loadFromCOnfig', () => {
    test('should load all plugins from config file', () => {
        expect.assertions(5)
        const contents = {
            plugins: [
                {
                    "name": "config",
                    "path": "../dist/config-plugin.js",
                    "enabled": true,
                    "options": {
                        "CONFIG_PATH": "./default.json",
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
        const path = Path.join(__dirname, `./${randomString()}.json`)
        fs.writeFileSync(path, JSON.stringify(contents))
        expect(fs.existsSync(path)).toBeTruthy();

        PluginLoader.loadFromConfig(server, path)
        expect(ConfigPlugin.plugin).toHaveBeenCalled();
        expect(MdnsPlugin.plugin).toHaveBeenCalled();
        expect(mockLoad).toHaveBeenCalledTimes(3); // jest.resetAllMocks is removing the mock methods(?) so can't reset call counter >:(
        fs.unlinkSync(path)
        expect(fs.existsSync(path)).toBeFalsy();
    });
});