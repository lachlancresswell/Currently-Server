import { PluginLoader } from '../../plugin-loader';
import { Server } from '../../server'
import { PluginConfig } from '../../../../Types';
import supertest from 'supertest';
import fs from 'fs';
import path from 'path';
import structuredClone from '@ungap/structured-clone';
import MDNSPlugin from '../../mdns-plugin';


class TestPluginLoader extends PluginLoader {
    publicLoadPlugin = this.loadPlugin;
    publicPlugins = this.plugins;
    setTestPlugins = (plugins: any[]) => this.plugins = plugins;
}

class TestServer extends Server {
    public publicPluginLoader = this.pluginLoader;
}

const configPath = './__tests__/plugin-config.test.json';

/**
 * PluginLoader test suite.
 */
describe('PluginLoader', () => {
    let pluginLoader: PluginLoader
    let server: TestServer;

    test('loadPlugins should call loadPlugin for each enabled plugin in the config', async () => {
        server = new TestServer(configPath);
        pluginLoader = server.publicPluginLoader;
        await server.end();

        expect(pluginLoader['plugins'].length).toBeGreaterThanOrEqual(1)
    });

    test('loadPlugins should call loadPlugin for each enabled plugin in the config', async () => {
        server = new TestServer(configPath);
        pluginLoader = server.publicPluginLoader;
        const plugin = pluginLoader['plugins'][0] as MDNSPlugin;
        const p = path.join(__dirname, '../../', configPath)
        const prevConfFile = JSON.parse(fs.readFileSync(p).toString());
        const oldPlugConf = plugin.configuration;
        const newPlugConf = structuredClone(oldPlugConf);
        newPlugConf.deviceName.value = 'testing'
        plugin.updateEntireConfig(newPlugConf);
        const newPlugFile = JSON.parse(fs.readFileSync(p).toString());
        expect(newPlugFile.MDNSPlugin.config.deviceName.value).toBe('testing')
        await server.end();
    });
});