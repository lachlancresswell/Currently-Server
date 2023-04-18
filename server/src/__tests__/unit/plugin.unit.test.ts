// Imports
import { Plugin, Route } from '../plugin';
import { mockServerRouting } from './__mocks__/mock-server'
import { ConfigVariableMetadata, ConfigArray } from '../../../Types';

// Mock class for testing the abstract Plugin class
class MockPlugin extends Plugin<any> {
}

const mockPluginConfig: ConfigArray = {
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

/**
 * Plugin Test Suite
 */
describe('Plugin', () => {
    let plugin: MockPlugin;
    const handler = () => { };
    const metadataMaxMin: ConfigVariableMetadata<number> = {
        priority: 1,
        readableName: 'Test Variable with max min allowed numbers',
        type: 'number',
        value: 5,
        max: 10,
        min: 1,
    };

    const metadataStringOptions: ConfigVariableMetadata<string> = {
        priority: 1,
        readableName: 'Test Variable with string options',
        type: 'string',
        value: 'option3',
        options: ['option1', 'option2', 'option3', 'option5']
    };

    beforeEach(() => {
        plugin = new MockPlugin(mockServerRouting, mockPluginConfig);
    });

    /**
     * Test: Registering a route
     */
    test('registerRoute should add a new route to the routes array', () => {
        plugin.registerRoute('/test', 'GET', handler);

        expect(plugin['routes']).toHaveLength(1);
        expect(plugin['routes'][0]).toEqual({
            path: '/test',
            type: 'GET',
            handler,
        });
    });

    /**
     * Test: Deregistering all routes
     */
    test('deregisterRoutes should remove all registered routes', () => {
        plugin.registerRoute('/test1', 'GET', handler);
        plugin.registerRoute('/test2', 'POST', handler);

        expect(plugin['routes']).toHaveLength(2);

        plugin.deregisterRoutes();

        expect(plugin['routes']).toHaveLength(0);
    });

    /**
     * Test: Removing a route
     */
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

    /**
     * Test: Adding a configuration variable
     */
    test('addConfigVariable should add a configuration variable with its metadata and initial value', () => {
        plugin.addConfigVariable('testVar', {
            priority: 1,
            readableName: 'Test Variable',
            type: 'number',
            value: 5,
            options: undefined,
            max: 10,
            min: 1,
        }, 5);

        expect(plugin['configuration']['testVar']).toEqual({
            priority: 1,
            readableName: 'Test Variable',
            type: 'number',
            value: 5,
            options: undefined,
            max: 10,
            min: 1,
        });
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

    /**
     * Test: Updating a configuration variable
     */
    test('updateConfigVariable should update the value of a configuration variable after validating the new value', () => {
        plugin.addConfigVariable('testVar', {
            priority: 1,
            readableName: 'Test Variable',
            type: 'number',
            value: 5,
            options: undefined,
            max: 10,
            min: 1,
        }, 5);

        expect(plugin.updateConfigVariable('testVar', 8)).toBe(true);
        expect(plugin['configuration']['testVar'].value).toBe(8);
    });

    /**
     * Test: Validating a value based on metadata constraints
     */
    test('validateValue should return true for a number less than the maximum allowed and greater than the minimum allowed', () => {
        const func = () => Plugin.validateValue(metadataMaxMin, 7);
        expect(func()).toBe(true);
        expect(func).not.toThrowError();

        expect.assertions(2)
    });

    /**
     * Test: Validating a value based on metadata constraints (failing case)
     */
    test('validateValue should return false for a number larger than the maximum allowed', () => {
        const func = () => Plugin.validateValue(metadataMaxMin, 11)
        expect(func).toThrowError();

        expect.assertions(1)
    });

    test('validateValue should return false for a number less than the minimum allowed', () => {

        const func = () => Plugin.validateValue(metadataMaxMin, -4)
        expect(func).toThrowError();

        expect.assertions(1)
    });

    test('validateValue should return true for a string that does exist in the options array when the array is populated', () => {

        const func = () => Plugin.validateValue(metadataStringOptions, metadataStringOptions.options![0])
        expect(func()).toBe(true);
        expect(func).not.toThrowError();

        expect.assertions(2)
    });

    test('validateValue should throw for a string that doesnt exist in the options array when the array is populated', () => {

        const func = () => { Plugin.validateValue(metadataStringOptions, 'mystring') }
        expect(func).toThrowError();

        expect.assertions(1)
    });

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
