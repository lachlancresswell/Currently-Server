// MDNSPlugin.test.ts
/**
 * Some tests will fail unless run by themselves.
 */
import MDNSPlugin, { Options, SERVICE_NAME } from '../../mdns-plugin';
import MockServer from "../__mocks__/server";

jest.mock('../../../node_modules/multicast-dns');

const defaultConfig: Options = {
    transmit: {
        priority: 1,
        readableName: 'Transmit',
        type: 'boolean',
        value: true,
    },
    receive: {
        priority: 1,
        readableName: 'Receive',
        type: 'boolean',
        value: true,
    },
    deviceName: {
        priority: 1,
        readableName: 'Device Name',
        type: 'string',
        value: 'test device',
    },
    txDelay: {
        priority: 1,
        readableName: 'Device Name',
        type: 'string',
        value: 500,
    }
}

/**
 * Class to expose protected functions for testing.
 */
class TestMDNSPlugin extends MDNSPlugin {
    public testNeighbours = () => this.neighbours;
    public testInterval = this.interval;
    public testHandleNeigbours = this.handleNeighbours;
    public testGetLocalIPAddresses = this.getLocalIPAddresses;
    public testMdns = this.mdns;
    public testMdnsOn = this.mdns.on as jest.MockedFunction<typeof this.mdns.on>;
}

let server: MockServer;

describe('changing initial configuration variables should modify plugin behaviours', () => {
    let plugin: TestMDNSPlugin;

    beforeEach(() => {
        server = new MockServer('./test-plugin-config.json');
    });

    afterEach(async () => {
        plugin.unload();
    });

    /**
     * Fails if not run by itself
     */
    test('transmit true should allow the plugin to respond to incoming requests', async () => {
        const testConfig = { ...defaultConfig };
        testConfig.transmit.value = true;

        plugin = new TestMDNSPlugin(server.Router!, testConfig);

        // Simulate a query event
        const queryCallback = plugin.testMdnsOn.mock.calls.find(([event]) => event === 'query')?.[1];
        if (queryCallback) {
            queryCallback({ questions: [{ name: `${SERVICE_NAME}._tcp.local`, type: 'PTR' }] });
        }

        await new Promise((res) => setTimeout(res, testConfig.txDelay.value + 100));
        expect(plugin.testMdns.respond).toHaveBeenCalled();

    });

    test('getLocalIPAddresses should return an array of valid ip addresses', () => {
        plugin = new TestMDNSPlugin(server.Router!, defaultConfig);

        const localIPAddresses = plugin.testGetLocalIPAddresses();

        expect(localIPAddresses).toBeInstanceOf(Array);

        localIPAddresses.forEach((ip) => {
            expect(typeof ip.address).toBe('string');
            expect(typeof ip.local).toBe('boolean');
            expect(ip.address.split('.').length).toBe(4);
        });

    });
})
