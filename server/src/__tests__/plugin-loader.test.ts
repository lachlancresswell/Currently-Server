import { PluginLoader } from '../plugin-loader';
import { PluginConfig } from '../../../Types'
import * as fs from 'fs';
import { mockServerRouting } from './__mocks__/mock-server'
import MockPlugin from './__mocks__/mock-plugin';

jest.mock('fs')


class TestPluginLoader extends PluginLoader {
    testLoadPlugin = this.loadPlugin;
    testPlugins = this.plugins;
    testPluginConfig = this.pluginConfigs
    setTestPlugins = (plugins: any[]) => this.plugins = plugins;
}

const mockPluginConfig: PluginConfig = {
    path: 'string',
    enabled: true,
    config: {
        "testVar1": {
            priority: 1,
            value: 1,
            type: 'number',
            readableName: 'Test Var 1',
        },
        "testVar2": {
            priority: 1,
            value: 2,
            type: 'number',
            readableName: 'Test Var 2',
        },
        "testVar3": {
            priority: 1,
            value: 3,
            type: 'number',
            readableName: 'Test Var 3',
        },
    }
}


/**
 * PluginLoader test suite.
 */
describe('PluginLoader', () => {
    let pluginLoader: TestPluginLoader

    beforeEach(() => {
        pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);
    })

    afterEach(() => {
        pluginLoader.unloadPlugins();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('loadPlugins should call loadPlugin for each enabled plugin in the config', () => {
        const mockConfig = {
            'MockPlugin1': { path: 'mock-plugin1', enabled: true, config: {} },
            'MockPlugin2': { path: 'mock-plugin2', enabled: false, config: {} }
        };
        pluginLoader['pluginConfigs'] = mockConfig;
        pluginLoader['loadPlugin'] = jest.fn();

        pluginLoader.loadPlugins();

        expect(pluginLoader['loadPlugin']).toHaveBeenCalledTimes(1);
        expect(pluginLoader['loadPlugin']).toHaveBeenCalledWith('MockPlugin1', mockConfig['MockPlugin1']);
    });

    test('unloadPlugins should unload all loaded plugins and empty the plugins array', () => {
        pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);

        const mockPlugin1 = new MockPlugin();
        const mockPlugin2 = new MockPlugin();
        pluginLoader.setTestPlugins([mockPlugin1 as any, mockPlugin2 as any]);

        pluginLoader.unloadPlugins();

        expect(mockPlugin1.unload).toHaveBeenCalledTimes(1);
        expect(mockPlugin2.unload).toHaveBeenCalledTimes(1);
        expect(pluginLoader.testPlugins).toHaveLength(0);
    });

    test('loadPlugin should load plugin and set initial configuration', () => {
        PluginLoader.loadFromPath = jest.fn(() => MockPlugin);
        pluginLoader.testLoadPlugin('myplug', mockPluginConfig);

        // Access loaded module
        const loadedPlugin = pluginLoader.testPlugins[0];
        expect(TestPluginLoader.loadFromPath).toHaveBeenCalledTimes(1);
        expect(loadedPlugin.configuration).toMatchObject(mockPluginConfig.config!);
    });

    test('loadPlugin should not load a plugin if it does not exist', () => {
        TestPluginLoader.loadFromPath = jest.fn(() => undefined);
        const loaded = pluginLoader.testLoadPlugin('myplug', mockPluginConfig)
        expect(loaded).toBeFalsy()
        expect(pluginLoader.testPlugins.length).toBeLessThan(1)
    });

    test('saves plugin configuration to disk when value updated', () => {

        // Override plugin loading
        PluginLoader.loadFromPath = jest.fn(() => MockPlugin);
        pluginLoader.testLoadPlugin('myplug', mockPluginConfig);

        // Access loaded module
        const loadedMockPlugin = pluginLoader.testPlugins[0];
        expect(loadedMockPlugin.configuration).toMatchObject(mockPluginConfig.config!);

        // New config should be written to disk when the event is emitted
        expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
        loadedMockPlugin.emit('configUpdated', 'mockKey', 'mockValue');
        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });


    test('skips disabled plugins', () => {
        pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        pluginLoader.loadPlugins();

        expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining('Failed to load plugin "DisabledPlugin"'));

        consoleErrorSpy.mockRestore();
    });

    test('unloads all loaded plugins', () => {
        pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);

        const mockPlug = {
            unload: jest.fn()
        };

        pluginLoader['plugins'] = [mockPlug, mockPlug, mockPlug] as any;
        pluginLoader.unloadPlugins();

        expect(mockPlug.unload).toHaveBeenCalledTimes(3);
        expect(pluginLoader['plugins'].length).toBe(0);
    });
});