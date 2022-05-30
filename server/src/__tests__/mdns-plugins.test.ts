import { mocked } from 'ts-jest/utils';
import * as Mdns from '../mdns-plugin';
import * as Server from '../server'
import * as Events from '../events';

jest.setTimeout(8000)

jest.mock("../server");
const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});

const randomString = () => (Math.random() + 1).toString(36).substring(7);
function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let mdns: Mdns.plugin | undefined;

afterEach(() => {
    mdns?.unload();
    mdns = undefined;
});


describe('Mdns plugin class initialisation', () => {
    beforeEach(() => {
        // Reset call counters
        jest.clearAllMocks();
    });


    test('Should start with default values when no options provided', async () => {
        expect.assertions(1);
        mdns = new Mdns.plugin(server)

        const defaultOptions: Mdns.Options = {
            HTTP_PORT: Mdns.DEFAULT_HTTP_PORT,
            HTTPS_PORT: Mdns.DEFAULT_HTTPS_PORT,
            HTTP_MDNS_SERVICE_NAME: Mdns.DEFAULT_HTTP_MDNS_SERVICE_NAME,
            HTTPS_MDNS_SERVICE_NAME: Mdns.DEFAULT_HTTPS_MDNS_SERVICE_NAME,
            SERVICE_NAME: Mdns.DEFAULT_SERVICE_NAME,
            MDNS_DOMAIN: Mdns.DEFAULT_MDNS_DOMAIN,
            ms: Mdns.DEFAULT_MS,
            discover: {
                restart: 'restart-plugin',
                readableName: 'Discoverable',
                priority: 1,
                value: Mdns.DEFAULT_DISCOVER,
            },
            advertise: Mdns.DEFAULT_ADVERTISE,
            device_name: {
                priority: 1,
                restart: 'restart-plugin',
                readableName: 'Device Name',
                value: Mdns.DEFAULT_DEVICE_NAME
            }
        }

        expect(mdns.options).toEqual(defaultOptions)
    });

    test('Should start have options stored when provided with constructor', async () => {
        expect.assertions(1);
        const options: Mdns.Options = {
            HTTP_PORT: randomInt(4000, 10000),
            'HTTPS_PORT': randomInt(4000, 10000),
            'HTTP_MDNS_SERVICE_NAME': randomString(),
            'HTTPS_MDNS_SERVICE_NAME': randomString(),
            'SERVICE_NAME': randomString(),
            'MDNS_DOMAIN': randomString(),
            'ms': 1000,
            'discover': {
                priority: 1,
                value: true,
                readableName: 'Discoverable',
                restart: 'restart-plugin',
            },
            'advertise': true,
            'device_name': {
                priority: 1,
                value: randomString(),
                readableName: 'Discoverable',
                restart: 'restart-plugin',
            },
        }
        mdns = new Mdns.plugin(server, options)

        expect(mdns.options).toEqual(options);

    });
});

describe('Mdns plugin methods', () => {
    test('load should create endpoints, start discovery and discover itself', async () => {
        expect.assertions(2);
        const options = { ms: 100 }
        mdns = new Mdns.plugin(server, options as Mdns.Options)

        mdns.load();
        await new Promise((res) => setTimeout(res, 200));
        expect(mdns.neighbours.addresses.length).toBeGreaterThan(0);
        expect(server.registerGetRoute).toHaveBeenCalled();

    });

    test('announced event should be heard', async () => {
        expect.assertions(1);

        mdns = new Mdns.plugin(server)
        const event = randomString();
        const data = randomString();

        mdns.listen(event, (name: string) => {
            expect(name[0]).toBe(data)
        })
        mdns.announce(event, data);

    });

    test('should update device name', async () => {
        expect.assertions(1);

        mdns = new Mdns.plugin(server)
        const deviceName = randomString();

        mdns.load();
        mdns.listen(Events.DEVICE_NAME_UPDATE, async () => {
            expect(mdns?.options.device_name.value).toBe(deviceName);
            mdns!.unload();
            mdns = undefined;
        })
        mdns.announce(Events.DEVICE_NAME_UPDATE, deviceName);
    });
});