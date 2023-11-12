// Imports
import { Plugin } from '../../plugin';
import { mockServerRouting } from '../__mocks__/mock-server'
import { ConfigArray } from '../../../../Types';
import { mockPluginConfig } from '../__mocks__/mock-plugin';

// Mock class for testing the abstract Plugin class
class MockPlugin extends Plugin<any> {
}

/**
 * Plugin Test Suite
 */
describe('Plugin', () => {
    let plugin: MockPlugin;
    const handler = () => { };

    beforeEach(() => {
        plugin = new MockPlugin(mockServerRouting, mockPluginConfig.plugin1.config!);
    });

    describe('registerRoute', () => {
        test('registerRoute should add a new route to the routes array', () => {
            plugin.registerRoute('/test', 'GET', handler);

            expect(plugin['routes']).toHaveLength(1);
            expect(plugin['routes'][0]).toEqual({
                path: '/test',
                type: 'GET',
                handler,
            });
        });
    });

    describe('deregisterRoutes', () => {
        test('deregisterRoutes should remove all registered routes', () => {
            plugin.registerRoute('/test1', 'GET', handler);
            plugin.registerRoute('/test2', 'POST', handler);

            expect(plugin['routes']).toHaveLength(2);

            plugin.deregisterRoutes();

            expect(plugin['routes']).toHaveLength(0);
        });
    });

    describe('removeRoute', () => {
        test('removeRoute should remove the route with the specified HTTP method and path', () => {
            plugin.registerRoute('/test1', 'GET', handler);
            plugin.registerRoute('/test2', 'POST', handler);

            expect(plugin['routes']).toHaveLength(2);

            plugin.removeRoute('POST', '/test2');

            expect(plugin['routes']).toHaveLength(1);
            expect(plugin['routes'][0]).toEqual({
                path: '/test1',
                type: 'GET',
                handler,
            });
        });
    });

    describe('addConfigVariable', () => {
        test('addConfigVariable should add a configuration variable with its metadata and initial value', () => {
            plugin.addConfigVariable('testVar', mockPluginConfig.plugin1.config!.testVar1, mockPluginConfig.plugin1.config!.testVar1.value);

            expect(plugin['configuration']['testVar']).toEqual(mockPluginConfig.plugin1.config!.testVar1);
        });

        test('addConfigVariable should return false to a non-valid value being added', () => {
            let obj: any = {
                priority: 1,
                readableName: 'Test Variable',
                type: 'number',
                value: 'helloworld',
            }
            let rtn = plugin.addConfigVariable('testVar', obj, obj.value);
            expect(rtn).toBeFalsy()

            obj = {
                priority: 1,
                readableName: 'Test Variable',
                type: 'string',
                value: 4,
            }
            rtn = plugin.addConfigVariable('testVar', obj, obj.value);
            expect(rtn).toBeFalsy()

            obj = {
                priority: 1,
                readableName: 'Test Variable',
                type: 'boolean',
                value: 4,
            }
            rtn = plugin.addConfigVariable('testVar', obj, obj.value);
            expect(rtn).toBeFalsy()

            obj = {
                priority: 1,
                readableName: 'Test Variable',
                type: 'ipaddress',
                value: '192.168.8.256',
            }
            rtn = plugin.addConfigVariable('testVar', obj, obj.value);
            expect(rtn).toBeFalsy()
        });
    });

    describe('updateConfigVariable', () => {
        test('updateConfigVariable should update the value of a configuration variable after validating the new value', () => {
            // Arrange
            plugin.addConfigVariable('testVar', mockPluginConfig.plugin1.config!.testVar1, mockPluginConfig.plugin1.config!.testVar1.value);

            // Act
            plugin.updateConfigVariable('testVar', 8);

            // Assert
            expect(plugin['configuration']['testVar'].value).toBe(8);
        });
    });

    describe('validateValue', () => {
        /**
         * Test: Validating a value based on metadata constraints
         */
        test('validateValue should return true for a number less than the maximum allowed and greater than the minimum allowed', () => {
            const func = () => Plugin.validateValue(mockPluginConfig.plugin1.config!.metadataMaxMin, 7);
            expect(func()).toBe(true);
            expect(func).not.toThrowError();

            expect.assertions(2)
        });

        /**
         * Test: Validating a value based on metadata constraints (failing case)
         */
        test('validateValue should return false for a number larger than the maximum allowed', () => {
            const func = () => Plugin.validateValue(mockPluginConfig.plugin1.config!.metadataMaxMin, 11)
            expect(func).toThrowError();

            expect.assertions(1)
        });

        test('validateValue should return false for a number less than the minimum allowed', () => {

            const func = () => Plugin.validateValue(mockPluginConfig.plugin1.config!.metadataMaxMin, -4)
            expect(func).toThrowError();

            expect.assertions(1)
        });

        test('validateValue should return true for a string that does exist in the options array when the array is populated', () => {

            const func = () => Plugin.validateValue(mockPluginConfig.plugin1.config!.metadataStringOptions, mockPluginConfig.plugin1.config!.metadataStringOptions.options![0])
            expect(func()).toBe(true);
            expect(func).not.toThrowError();

            expect.assertions(2)
        });

        test('validateValue should throw for a string that doesnt exist in the options array when the array is populated', () => {

            const func = () => { Plugin.validateValue(mockPluginConfig.plugin1.config!.metadataStringOptions, 'mystring') }
            expect(func).toThrowError();

            expect.assertions(1)
        });
    });

    describe('validateTimezone', () => {
        /**
         * Test: Validating a valid timezone
         */
        test('validateTimezone should return true for valid timezones', () => {
            expect(Plugin.validateTimezone('America/New_York')).toBe(true);
        });

        /**
         * Test: Validating an invalid timezone
         */
        test('validateTimezone should return false for invalid timezones', () => {
            expect(Plugin.validateTimezone('Invalid/Timezone')).toBe(false);
        });
    });

    describe('validateIPAddress', () => {
        /**
         * Test: Validating a valid IP address
        */
        test('validateIPAddress should return true for valid IP addresses', () => {
            expect(Plugin.validateIPAddress('192.168.1.1')).toBe(true);
            expect(Plugin.validateIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
        });

        /**
         * Test: Validating an invalid IP address
        */
        test('validateIPAddress should return false for invalid IP addresses', () => {
            expect(Plugin.validateIPAddress('256.168.1.1')).toBe(false);
            expect(Plugin.validateIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334:7335')).toBe(false);
        });
    });

    describe('jsonConverter', () => {
        /**
         * Test: Converting an object to a JSON object
         */
        it('should convert an object to a JSON object', () => {
            const obj = {
                test: 'test',
            };
            expect(Plugin.jsonConverter(obj)).toEqual({ test: 'test' });
        });

        // TODO: test for getter

        it('should remove the getter and setter functions from an object', () => {
            // Arrange
            const obj = {
                test: 'test',
            };
            Object.defineProperty(obj, "value", {
                get: () => { },
            })

            // Act
            const rtn = Plugin.jsonConverter(obj);

            // Assert
            expect((rtn as any).value).toBeFalsy();
        });
    });

    describe('setEphemeralVariable', () => {
        it('should set a getter for the variable', () => {
            // Arrange
            const getter = () => 7;

            // Act
            plugin.setEphemeralVariable(mockPluginConfig.plugin1.config!.testVar1, getter);

            // Assert
            expect(mockPluginConfig.plugin1.config!.testVar1.value).toBe(getter());
        });

        it('should set a getter and setter for the variable', () => {
            // Arrange
            let value = 7
            const getter = () => value;
            const setter = (val: any) => value = val;

            // Act
            plugin.setEphemeralVariable(mockPluginConfig.plugin1.config!.testVar1, getter, setter);

            // Assert
            expect(mockPluginConfig.plugin1.config!.testVar1.value).toBe(getter());
            setter(10);
            expect(mockPluginConfig.plugin1.config!.testVar1.value).toBe(10);
            expect(getter()).toBe(10);
        });

        it('should set a toJSON method for the variable', () => {
            // Act
            plugin.setEphemeralVariable(mockPluginConfig.plugin1.config!.testVar1, () => false);

            // Assert
            expect((mockPluginConfig.plugin1.config!.testVar1 as any).toJSON).toBeTruthy();
        });
    });

    describe('updateEntireConfig', () => {
        // TODO: Must be run by itself for some reason?
        it('should update the configuration variables with the new values', () => {
            // Arrange
            const newConfig: ConfigArray = {
                testVar1: { ...mockPluginConfig.plugin1.config!.testVar1 },
            }
            newConfig.testVar1.value = 10;

            // Act
            const restart = plugin.updateEntireConfig(newConfig);

            // Assert
            expect(restart).toBe(mockPluginConfig.plugin1.config!.testVar1.restart);
            expect(plugin['configuration']['testVar1'].value).toBe(10);
        });

        it('should should throw if new value is wrong type', () => {
            // Arrange
            const newConfig: ConfigArray = {
                testVar1: { ...mockPluginConfig.plugin1.config!.testVar1 },
            }
            newConfig.testVar1.value = '10';

            // Assert
            expect(() => plugin.updateEntireConfig(newConfig)).toThrow();
        });

        it('should return "plugin" if a plugin needs to be restarted', () => {
            // Arrange
            const newConfig: ConfigArray = {
                testVar1: { ...mockPluginConfig.plugin1.config!.testVar1 },
            }
            newConfig.testVar1.value = 10;
            plugin.updateConfigVariable = jest.fn().mockReturnValue('plugin');

            // Act
            const restart = plugin.updateEntireConfig(newConfig);

            // Assert
            expect(restart).toBe('plugin');
            expect(plugin.updateConfigVariable).toHaveBeenCalledTimes(1);
        });

        it('should not update the config if the new variable is identical', () => {
            // Arrange
            const newConfig: ConfigArray = {
                testVar1: { ...mockPluginConfig.plugin1.config!.testVar1 },
            }
            plugin.emit = jest.fn();

            // Act
            const restart = plugin.updateEntireConfig(newConfig);

            // Assert
            expect(plugin.emit).not.toHaveBeenCalled();
        });

        it('should not update call to restart the plugin or server if the new variable is identical', () => {
            // Arrange
            const newConfig: ConfigArray = {
                testVar1: { ...mockPluginConfig.plugin1.config!.testVar1 },
            }

            // Act
            const restart = plugin.updateEntireConfig(newConfig);

            // Assert
            expect(restart).toBe(undefined);
        });

        it('should return "server" if the server needs to be restarted', () => {
            // Arrange
            const newConfig: ConfigArray = {
                testVar1: {
                    priority: 1,
                    readableName: 'Test Variable 1',
                    type: 'number',
                    value: 10,
                    key: 'testVar1',
                },
                testVar2: {
                    priority: 2,
                    readableName: 'Test Variable 2',
                    type: 'string',
                    value: 'new value',
                    key: 'testVar2',
                },
            };
            plugin.updateConfigVariable = jest.fn().mockReturnValue('server');

            // Act
            const restart = plugin.updateEntireConfig(newConfig);

            // Assert
            expect(restart).toBe('server');
            expect(plugin.updateConfigVariable).toHaveBeenCalledTimes(2);
        });

        it('should sort the configuration variables if a sort function is provided', () => {
            // Arrange
            plugin['sort'] = jest.fn((keys: string[]) => keys)

            // Act
            const restart = plugin.updateEntireConfig(mockPluginConfig.plugin1.config!);

            // Assert
            expect(restart).toBeUndefined();
            expect(plugin['sort']).toHaveBeenCalledTimes(1);
        });
    });
});
