import { mocked } from 'ts-jest/utils';
import * as DeviceName from '../ota-plugin';
import * as Server from '../server'
import * as PluginLoader from '../plugin-loader';
import Path from 'path';

jest.mock("../server");

const MODULE_NAME = "device_name";

const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});

const randomString = () => (Math.random() + 1).toString(36).substring(7);

describe('Config plugin class initialisation', () => {
    test('Should start with default values', async () => {
        expect.assertions(1)
        const plugins = PluginLoader.loadConfig(Path.join(__dirname, '../../plugins.json'))
        const config = plugins!.find((plug) => plug.name === MODULE_NAME)!;
        config.path = Path.join(__dirname, '../../dist/' + config.path);
        const module = await PluginLoader.load(server, config)
        expect((module as PluginLoader.PluginConfig).module.options).toHaveProperty('name');
    });
});