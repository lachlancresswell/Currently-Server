import { PluginLoader } from '../../plugin-loader';
import { Server } from '../../server'

jest.mock('multicast-dns');

const configPath = './__tests__/plugin-config.test.json';

/**
 * PluginLoader test suite.
 */
describe('PluginLoader', () => {
    let pluginLoader: PluginLoader
    let server: Server;

    beforeEach(() => {
        server = new Server(configPath);
    });
    afterEach(async () => {
        await server.end();
    });

    test('loadPlugins should call loadPlugin for each enabled plugin in the config', async () => {
        pluginLoader = server['pluginLoader'];

        expect(pluginLoader['plugins'].length).toBeGreaterThanOrEqual(1)
    });
});