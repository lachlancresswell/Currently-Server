// MDNSPlugin.ts
import { Plugin } from './plugin';
import multicastDns from 'multicast-dns';
import { Answer } from "dns-packet";
import { IncomingMessage, ServerResponse } from 'http';
import { Routing } from './server';
import { networkInterfaces } from 'os';
import { ConfigArray, ConfigVariableMetadata, MDNSConfig, Neighbour, ipaddress } from '../../Types';

// Add this constant at the top of the file, after the `import` statements
export const SERVICE_NAME = 'your-service-name';

/**
 * MDNSPlugin is a class that periodically advertises a service called 'OTA Network',
 * listens for and discovers other 'OTA Network' devices, and registers the '/neighbours' route.
 * It serves all discovered neighboring OTA devices, their IP address, and their names via a JSON object.
 */
class MDNSPlugin extends Plugin<MDNSConfig> {
    protected mdns?: multicastDns.MulticastDNS;
    protected neighbours: Neighbour[] = [];
    protected interval?: NodeJS.Timer;
    public name = 'MDNSPlugin';

    constructor(app: Routing, options: MDNSConfig) {
        super(app, options);
    }

    /**
     * Loads the MDNSPlugin and starts advertising the service, discovering neighbours, and registering routes.
    */
    public load = () => {
        this.mdns = multicastDns({ loopback: true });
        this.setupMulticastDns();
        this.registerRoute('/neighbours', 'GET', this.handleNeighbours);
    }

    /**
     * Unloads the MDNSPlugin and stops advertising the service, discovering neighbours, and removes routes.
     */
    public unload = () => {
        super.unload()

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        if (this.mdns) {
            this.mdns.destroy();
            this.mdns = undefined;
        }
    }

    /**
     * Sets up multicast DNS using the 'multicast-dns' package.
     */
    protected setupMulticastDns() {
        const _this = this;
        const deviceName = this.configuration.deviceName.value!;

        const uniqueMacPortion = MDNSPlugin.getUniqueMacPortion();
        const serviceSuffix = `${SERVICE_NAME}._tcp.local`;
        const serviceName = `${uniqueMacPortion}.${serviceSuffix}`;

        if (this.mdns) this.mdns.on('query', (query) => {
            const localIPAddresses = MDNSPlugin.getLocalIPAddresses();

            const ttl = 10;

            const isQueryFromSelf = query.questions.some(
                (question) =>
                    question.type === 'PTR' &&
                    question.name === serviceName &&
                    this.configuration.transmit.value
            );

            const resObj = (data: string) => ({
                name: deviceName,
                type: 'A' as any,
                ttl,
                data
            })

            const dataResponse = isQueryFromSelf
                ? [resObj('127.0.0.1')]
                : localIPAddresses.find((ip) => ip.address !== '127.0.0.1');

            if (query.questions.some((question) => question.type === 'PTR' && question.name.includes(serviceSuffix) && this.configuration.transmit.value)) {
                if (this.mdns) this.mdns.respond([
                    {
                        name: serviceSuffix,
                        type: 'PTR',
                        ttl,
                        data: serviceName,
                    },
                    {
                        name: deviceName,
                        type: 'SRV',
                        ttl,
                        data: {
                            port: 3000, // Change this to the actual port the device is using
                            target: uniqueMacPortion,
                        },
                    },
                    ...dataResponse as any,
                ]);
            }
        });


        if (this.mdns) this.mdns.on('response', (response) => {
            this.updateNeighbours(response.answers);
        });

        _this.mdns?.query({ questions: [{ name: serviceName, type: 'PTR' }] });

        this.interval = setInterval(() => {
            if (_this.configuration.receive.value) {
                if (_this.mdns) _this.mdns.query({ questions: [{ name: serviceName, type: 'PTR' }] });
            }
        }, this.configuration.txDelay.value);
    }

    /**
     * Updates the neighbours list based on the multicast DNS response.
     * @param answers - An array of DNS answers from the multicast DNS response.
     */
    private updateNeighbours(answers: Answer[]) {
        const deviceMap: Map<string, Neighbour> = new Map();

        answers.forEach((answer) => {
            if (answer.type === 'SRV') {
                const deviceName = answer.name;
                if (!deviceMap.has(deviceName)) {
                    deviceMap.set(deviceName, {
                        name: deviceName,
                        date: new Date(),
                        address: '',
                    });
                }
            }
        });



        answers.forEach((answer) => {
            if (answer.type === 'A') {
                const deviceName = answer.name;
                const device = deviceMap.get(deviceName);

                if (device) {
                    device.address = (answer as any).data;
                }
            }
        });

        this.neighbours = Array.from(deviceMap.values());
    }

    /**
     * Handles the '/neighbours' route request and serves the list of discovered neighbours as a JSON object.
     * @param req - The incoming HTTP request.
     * @param res - The outgoing HTTP response.
     */
    protected handleNeighbours = (_req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(this.neighbours));
    }

    /**
     * Retrieves the local IP addresses for all non-internal IPv4 network interfaces.
     * @returns {string[]} An array of local IP addresses as strings.
     */
    static getLocalIPAddresses(): {
        address: string,
        local: boolean
    }[] {
        const NICs = networkInterfaces();
        const addresses: {
            address: string,
            local: boolean
        }[] = [];

        for (const interfaceName in NICs) {
            const networkInterface = NICs[interfaceName];
            if (networkInterface) {
                for (const iface of networkInterface) {
                    if (iface.family === 'IPv4') {
                        addresses.push({ address: iface.address, local: iface.internal });
                    }
                }
            }
        }
        return addresses;
    }

    /**
     * Retrieves the unique portion of the MAC address.
     * @returns {string} The unique portion of the MAC address.
     */
    static getUniqueMacPortion(): string {
        const nics = networkInterfaces();

        for (const key in nics) {
            const nic = nics[key];
            if (nic) {
                for (const iface of nic) {
                    if (!iface.internal && iface.mac) {
                        const macParts = iface.mac.split(':');
                        return macParts.slice(3).join('');
                    }
                }
            }
        }

        return 'unknown';
    }
}

export default MDNSPlugin;
