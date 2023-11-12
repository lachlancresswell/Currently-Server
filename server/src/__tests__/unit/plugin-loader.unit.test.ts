import { PluginLoader } from '../../plugin-loader';
import { PluginConfig, PluginJSON } from '../../../../Types'
import * as fs from 'fs';
import { mockServerRouting } from '../__mocks__/mock-server'
import MockPlugin, { MOCK_PLUGIN_NAME } from '../__mocks__/mock-plugin';
import path from 'path';

jest.mock('fs')


class TestPluginLoader extends PluginLoader {
    setTestPlugins = (plugins: any[]) => this.plugins = plugins;
}

const mockPluginConfig: PluginJSON = {
    plugin1: {
        path: 'string',
        enabled: true,
        config: {
            "testVar1": {
                priority: 1,
                value: 1,
                type: 'number',
                readableName: 'Test Var 1',
                key: 'testVar1',
            },
            "testVar2": {
                priority: 1,
                value: 2,
                type: 'number',
                readableName: 'Test Var 2',
                key: 'testVar2',
            },
            "testVar3": {
                priority: 1,
                value: 3,
                type: 'number',
                readableName: 'Test Var 3',
                key: 'testVar3',
            },
        }
    },
    plugin2: {
        path: 'string',
        enabled: true,
        config: {
            "testVar1": {
                priority: 1,
                value: 1,
                type: 'number',
                readableName: 'Test Var 1',
                key: 'testVar1',
            },
            "testVar2": {
                priority: 1,
                value: 2,
                type: 'number',
                readableName: 'Test Var 2',
                key: 'testVar2',
            },
            "testVar3": {
                priority: 1,
                value: 3,
                type: 'number',
                readableName: 'Test Var 3',
                key: 'testVar3',
            },
        }
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

    describe('loadPlugin', () => {
        it('loadPlugin should not load a plugin if it does not exist', () => {
            // Arrange
            PluginLoader.loadFromPath = jest.fn(() => undefined);

            // Act
            const loaded = pluginLoader['loadPlugin']('myplug', mockPluginConfig.plugin1)

            // Assert
            expect(loaded).toBeFalsy()
            expect(pluginLoader['plugins'].length).toBeLessThan(1)
        });

        it('loadPlugin should load plugin and set initial configuration', () => {
            PluginLoader.loadFromPath = jest.fn(() => MockPlugin);
            pluginLoader['loadPlugin']('myplug', mockPluginConfig.plugin1);

            // Access loaded module
            const loadedPlugin = pluginLoader['plugins'][0];
            expect(TestPluginLoader.loadFromPath).toHaveBeenCalledTimes(1);
            expect(loadedPlugin.configuration).toMatchObject(mockPluginConfig.plugin1.config!);
        });
    });

    describe('loadPlugins', () => {
        it('should call loadPlugin for each enabled plugin in the config', () => {
            // Arrange
            const mockConfig = {
                'MockPlugin1': { path: 'mock-plugin1', enabled: true, config: {} },
                'MockPlugin2': { path: 'mock-plugin2', enabled: false, config: {} }
            };
            pluginLoader['pluginConfigs'] = mockConfig;
            pluginLoader['loadPlugin'] = jest.fn();

            // Act
            pluginLoader.loadPlugins();

            // Assert
            expect(pluginLoader['loadPlugin']).toHaveBeenCalledTimes(1);
            expect(pluginLoader['loadPlugin']).toHaveBeenCalledWith('MockPlugin1', mockConfig['MockPlugin1']);
        });

        it('skips disabled plugins', () => {
            // Arrange
            pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            // Act
            pluginLoader.loadPlugins();

            // Assert
            expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining('Failed to load plugin "DisabledPlugin"'));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('unloadPlugins', () => {
        it('should unload all loaded plugins and empty the plugins array', () => {
            pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);

            const mockPlugin1 = new MockPlugin();
            const mockPlugin2 = new MockPlugin();
            pluginLoader.setTestPlugins([mockPlugin1 as any, mockPlugin2 as any]);

            pluginLoader.unloadPlugins();

            expect(mockPlugin1.unload).toHaveBeenCalledTimes(1);
            expect(mockPlugin2.unload).toHaveBeenCalledTimes(1);
            expect(pluginLoader['plugins']).toHaveLength(0);
        });
    });

    describe('reloadPlugin', () => {
        it('should reload a plugin', () => {
            // Arrange
            pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);
            const mockPlugin1 = new MockPlugin();
            pluginLoader.setTestPlugins([mockPlugin1 as any]);

            const mockConfig = {
                [MOCK_PLUGIN_NAME]: { path: 'mock-plugin1', enabled: true, config: {} }
            };
            const mockConfigString = JSON.stringify(mockConfig);
            jest.spyOn(fs, 'readFileSync').mockReturnValue(mockConfigString);

            PluginLoader.loadFromPath = jest.fn(() => MockPlugin);

            // Act
            const result = pluginLoader.reloadPlugin(MOCK_PLUGIN_NAME);

            // Assert
            expect(result).toBeTruthy();
            expect(mockPlugin1.unload).toHaveBeenCalledTimes(1);
            // TODO: Mocked load() reference is lost on reload
            // expect(mockPlugin1.load).toHaveBeenCalledTimes(1);

        });

        it('should not reload a plugin if it does not exist', () => {
            // Arrange
            pluginLoader = new TestPluginLoader('__tests__/plugin-config.json', mockServerRouting);
            const mockPlugin1 = new MockPlugin();
            pluginLoader.setTestPlugins([mockPlugin1 as any]);

            // Act
            const result = pluginLoader.reloadPlugin('MockPlugin2');

            // Assert
            expect(result).toBeFalsy();
            expect(mockPlugin1.unload).not.toHaveBeenCalled();
            expect(mockPlugin1.load).not.toHaveBeenCalled();
        });
    });

    describe('loadConfig', () => {
        it('should load the config file', () => {
            // Arrange
            const mockConfig = {
                [MOCK_PLUGIN_NAME]: { path: 'mock-plugin1', enabled: true, config: {} }
            };
            const mockConfigString = JSON.stringify(mockConfig);
            jest.spyOn(fs, 'readFileSync').mockReturnValue(mockConfigString);

            // Act
            const result = pluginLoader['loadConfig'](MOCK_PLUGIN_NAME);

            // Assert
            expect(result).toMatchObject(mockConfig[MOCK_PLUGIN_NAME]);
        });
    });

    describe('saveConfigs', () => {
        it('should save the config file', () => {
            // Arrange
            jest.spyOn(JSON, 'stringify');
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { });
            (pluginLoader as any)['pluginConfigs'] = mockPluginConfig.config;

            // Act
            pluginLoader['saveConfigs']();

            // Assert
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(JSON.stringify).toHaveBeenCalledWith(mockPluginConfig.config, expect.anything(), expect.anything());
        });

        it('should not save the config file if the config is empty', () => {
            // Arrange
            jest.spyOn(fs, 'writeFileSync').mockImplementation(() => { });

            // Act
            pluginLoader['saveConfigs']();

            // Assert
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });
    });

    describe('loadConfigs', () => {
        it('should load the config file', () => {
            // Arrange
            const mockConfigString = JSON.stringify(mockPluginConfig);
            jest.spyOn(fs, 'readFileSync').mockReturnValue(mockConfigString);
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);

            // Act
            const result = pluginLoader['loadConfigs']();

            // Assert
            expect(result).toMatchObject(mockPluginConfig);
        });

        it('should return undefined if the config file does not exist', () => {
            // Arrange
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            // Act
            const result = pluginLoader['loadConfigs']();

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe('initRoutes', () => {
        it('should register a route for each plugin', () => {
            // Arrange
            const mockPlugin1 = new MockPlugin();
            const mockPlugin2 = new MockPlugin();
            pluginLoader.setTestPlugins([mockPlugin1 as any, mockPlugin2 as any]);

            // Act
            pluginLoader['initRoutes']();

            // Assert
            expect(mockServerRouting.registerGetRoute).toHaveBeenCalledTimes(4);
            expect(mockServerRouting.registerPutRoute).toHaveBeenCalledTimes(2);
        });
    });
});