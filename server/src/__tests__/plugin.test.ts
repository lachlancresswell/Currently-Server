// Imports
import { Plugin, Route, ConfigVariableMetadata } from '../plugin';
import { mockServerRouting } from './__mocks__/server'

// Mock class for testing the abstract Plugin class
class MockPlugin extends Plugin<any> {
    load(): void {
        // Mock load implementation
    }

    unload(): void {
        // Mock unload implementation
    }
}

/**
 * Plugin Test Suite
 */
describe('Plugin', () => {
    let plugin: MockPlugin;
    const handler = () => { };
    const metadata: ConfigVariableMetadata<number> = {
        priority: 1,
        readableName: 'Test Variable',
        type: 'number',
        value: 5,
        options: undefined,
        max: 10,
        min: 1,
    };

    beforeEach(() => {
        plugin = new MockPlugin(mockServerRouting);
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
    test('validateValue should return true for valid values', () => {

        expect(plugin.validateValue(metadata, 7)).toBe(true);
    });

    /**
     * Test: Validating a value based on metadata constraints (failing case)
     */
    test('validateValue should return false for invalid values', () => {

        expect(plugin.validateValue(metadata, 11)).toBe(false);
    });

    /**
     * Test: Validating a valid timezone
     */
    test('validateTimezone should return true for valid timezones', () => {
        expect(plugin.validateTimezone('America/New_York')).toBe(true);
    });

    /**
     * Test: Validating an invalid timezone
     */
    test('validateTimezone should return false for invalid timezones', () => {
        expect(plugin.validateTimezone('Invalid/Timezone')).toBe(false);
    });

    /**
     * Test: Validating a valid IP address
     */
    test('validateIPAddress should return true for valid IP addresses', () => {
        expect(plugin.validateIPAddress('192.168.1.1')).toBe(true);
        expect(plugin.validateIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    });

    /**
     * Test: Validating an invalid IP address
     */
    test('validateIPAddress should return false for invalid IP addresses', () => {
        expect(plugin.validateIPAddress('256.168.1.1')).toBe(false);
        expect(plugin.validateIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334:7335')).toBe(false);
    });
});
