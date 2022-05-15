import { mocked } from 'ts-jest/utils';
import * as Config from '../config-plugin';
import * as Server from '../server'
import * as Plugin from '../plugin'
import fs from 'fs';
import Path from 'path'

let config: any;

jest.mock("../server");

const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});

const randomString = () => (Math.random() + 1).toString(36).substring(7);
const randomNum = () => Math.ceil(Math.random() * 10000)

beforeEach(() => {
    // Reset call counters
    jest.clearAllMocks();
});

describe('Config plugin class initialisation', () => {

    test('Should start without options passed and have default values set', () => {
        const config = new Config.plugin(server)
        expect(config.options.CONFIG_PATH).toBe(Config.DEFAULT_CONFIG_PATH);
    });

    test('Env var should overwrite all other settings', () => {
        process.env.CONFIG_PATH = randomString()
        const options: Config.Options = { CONFIG_PATH: randomString() };
        const config = new Config.plugin(server, options)
        expect(config.options.CONFIG_PATH).toBe(process.env.CONFIG_PATH);
        delete process.env.CONFIG_PATH;
    });

    test('should not create a file or extra endpoints from empty config', () => {
        const options: Config.Options = { CONFIG_PATH: randomString() }
        const config = new Config.plugin(server, options)
        expect(config.options.CONFIG_PATH).toBe(options.CONFIG_PATH);
        expect(config.app.registerEndpoint).toHaveBeenCalledTimes(1);
        expect(fs.existsSync(`../../${config.options.CONFIG_PATH}`)).toBeFalsy()
    });

    test('should create a file and endpoints from options provided to constructor', () => {
        const options: Config.Options = {
            CONFIG_PATH: Path.join(__dirname, `./${randomString()}.json`),
            default: {
                testKey: `value-${randomString()}`
            }
        }
        const config = new Config.plugin(server, options);

        expect(config.options.CONFIG_PATH).toBe(options.CONFIG_PATH);
        expect(config.app.registerEndpoint).toHaveBeenCalledTimes(3); // Once for getter, once for setter
        expect(fs.existsSync(options.CONFIG_PATH)).toBeTruthy()
        fs.unlinkSync(options.CONFIG_PATH);
    });

    test('should load a file and create endpoints from loaded file', () => {
        const key = randomString();
        const contents: any = {}
        contents[key] = randomString();
        const CONFIG_PATH = Path.join(__dirname, `./${randomString()}.json`);
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(contents))
        const options: Config.Options = { CONFIG_PATH }
        const config = new Config.plugin(server, options);

        expect(config.options.CONFIG_PATH).toBe(CONFIG_PATH);
        expect(config.options[key]).toBe(options[key]);
        expect(config.app.registerEndpoint).toHaveBeenCalledTimes(1 + (Object.keys(contents).length * 2)); // Once for getter, once for setter
        expect(fs.existsSync(CONFIG_PATH)).toBeTruthy()
        fs.unlinkSync(CONFIG_PATH);
    });
});

describe('Proxy tests', () => {
    let config: Config.plugin;
    let myPlugin: Plugin.Instance;
    let options: Config.Options;

    beforeEach(() => {
        options = {
            CONFIG_PATH: Path.join(__dirname, `./${randomString()}.json`),
            default: { testKey: `value-${randomString()}` }
        }
        config = new Config.plugin(server, options);
        myPlugin = new Plugin.Instance(server);
        myPlugin.load();
    });

    afterEach(() => fs.unlinkSync(options.CONFIG_PATH))

    test('proxy should be returned for anonymous plugin and config options are returned on new plug', () => {
        expect(JSON.stringify(myPlugin.options)).toEqual(JSON.stringify(options.default))
    })

    test('setting value on config plugin sets value on external plugin', () => {
        const strKey = randomString();
        const numKey = randomString();
        config.settings[strKey] = randomString();
        config.settings[numKey] = randomNum();
        expect(myPlugin.options).toHaveProperty(strKey);
        expect(myPlugin.options).toHaveProperty(numKey);
        expect(myPlugin.options[strKey]).toEqual(config.settings[strKey]);
        expect(myPlugin.options[numKey]).toEqual(config.settings[numKey]);
    })

    test('setting value on external plugin sets value on config plugin', () => {
        const strKey = randomString();
        const numKey = randomString();
        myPlugin.options[strKey] = randomString();
        myPlugin.options[numKey] = randomNum();
        expect(config.settings).toHaveProperty(strKey);
        expect(config.settings).toHaveProperty(numKey);
        expect(myPlugin.options[strKey]).toEqual(config.settings[strKey]);
        expect(myPlugin.options[numKey]).toEqual(config.settings[numKey]);

    })

    test('setting value on external plugin saves to disk', () => {
        const strKey = randomString();
        const numKey = randomString();
        myPlugin.options[strKey] = randomString();
        myPlugin.options[numKey] = randomNum();
        const configOnDisk = fs.readFileSync(options.CONFIG_PATH, "utf8")
        expect(configOnDisk).toEqual(JSON.stringify(config.settings))
    })
});