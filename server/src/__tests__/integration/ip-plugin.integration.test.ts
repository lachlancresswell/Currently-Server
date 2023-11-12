import IPPlugin, { Address } from '../../ip-plugin';
import fs from 'fs';
import request from 'supertest';
import { Server } from '../../server';

/**
 * Returns a random IP address.
 * @returns a random IP address
 * @example '102.52.91.231'
 */
const randomIp = () => (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));

/**
 * Returns a random CIDR network prefix.
 * @returns a random CIDR network prefix
 * @example 16
 */
const randomPrefix = () => {
    const max = 16; // half of the range
    const min = 0;
    const randomEven = Math.floor(Math.random() * (max + 1 - min)) + min;
    return randomEven
}

let DEVICE_IP = randomIp();
let DNS_SERVERS = [randomIp(), randomIp()]
let DHCP_STATUS = true;
let GATEWAY_STATUS = true;
const GATEWAY_IP = randomIp();

/**
 * Mocks the os module to return a NIC configuration of our choosing.
 */
jest.mock('os', () => {
    const originalOs = jest.requireActual('os');
    return {
        ...originalOs,
        networkInterfaces: jest.fn(() => {
            return {
                enp0s1: [
                    {
                        address: DEVICE_IP,
                        netmask: '255.0.0.0',
                        family: 'IPv4',
                        mac: '00:00:00:00:00:00',
                        internal: true,
                        cidr: '127.0.0.1/8'
                    }
                ],
            }
        })
    }
})

/**
 * Mocks the axios module to return a status of our choosing.
 */
let GOOGLE_STATUS = true;
jest.mock('axios', () => {
    return {
        get: jest.fn(() => {
            return Promise.resolve({ status: GOOGLE_STATUS ? 200 : 404 });
        })
    }
})



/**
 * Mocks the dns module to return a DNS server configuration of our choosing.
 */
jest.mock('dns', () => {
    return {
        getServers: jest.fn(() => {
            return DNS_SERVERS;
        })
    }
})

/**
 * Mocks the child_process module to return a network configuration of our choosing.
 */
jest.mock("child_process", () => {
    return {
        exec: jest.fn((cmd: string, cb: (err: any, stdout: any, stderr: any) => void) => {
            if (cmd.includes('ip route | grep default')) {

                cb(undefined, GATEWAY_IP, undefined)
            } else {
                cb(undefined, '', undefined);
            }
        }),
        execSync: jest.fn((cmd: string) => {
            if (cmd.includes('ip route')) {
                let str = '';
                if (GATEWAY_STATUS) {
                    str += `default via ${GATEWAY_IP} dev enp0s1 proto dhcp metric 100`

                }
                str += `172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown 
                172.18.0.0/16 dev br-786958bb02ca proto kernel scope link src 172.18.0.1 linkdown 
                192.168.64.0/24 dev enp0s1 proto kernel scope link src 192.168.64.4 metric 100 `;

                return str
            } else return `2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
                link/ether 42:85:ff:dd:82:53 brd ff:ff:ff:ff:ff:ff
                inet ${DEVICE_IP}/24 brd 192.168.64.255 scope global ${DHCP_STATUS ? 'dynamic' : ''} noprefixroute enp0s1
                   valid_lft 50745sec preferred_lft 50745sec
                inet6 fdfc:b5bb:4718:11f6:347f:d2bb:644d:f114/64 scope global ${DHCP_STATUS ? 'dynamic' : ''} noprefixroute 
                   valid_lft 2591960sec preferred_lft 604760sec
                inet6 fe80::ee8f:3e9e:80e1:d47c/64 scope link noprefixroute 
                   valid_lft forever preferred_lft forever`
        }),
    }
});

class TestPlugin extends IPPlugin {
    publicServerRouter = this.serverRouter;
    public static publicCreateNetworkFile = IPPlugin.createNetworkFile;

    constructor(serverRouter: any, options: any) {
        super(serverRouter, options);
        this.name = 'TestPlugin';
    }
}

describe('TestPlugin', () => {
    let server: Server;
    let plugin: TestPlugin;
    const filePath = './20-wired.network';

    beforeEach(() => {
        DEVICE_IP = randomIp();
        GATEWAY_STATUS = true;
        server = new Server('./__tests__/ip-plugin-config.test.json');
        plugin = server['pluginLoader']['plugins'][0] as any;

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    afterEach(async () => {
        plugin.unload();
        await server.end();
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    describe('publicCreateNetworkFile', () => {
        it('should create a valid .network file', async () => {
            // Arrange
            const config: Address = {
                internal: false,
                dhcp: false,
                ipaddress: '192.168.1.100',
                prefix: 24,
                gateway: '192.168.1.1',
                dns: ['8.8.8.8', '8.8.4.4']
            };

            // Act
            TestPlugin.publicCreateNetworkFile(config, filePath, 'en0');

            // Assert
            expect(fs.existsSync(filePath)).toBeTruthy();
        });

        it('an existing .network file should be deleted and replaced', async () => {
            // Arrange
            const config: Address = {
                internal: false,
                dhcp: false,
                ipaddress: '192.168.1.100',
                prefix: 24,
                gateway: '192.168.1.1',
                dns: ['8.8.8.8', '8.8.4.4']
            };

            fs.writeFileSync(filePath, 'testing')

            // Act
            TestPlugin.publicCreateNetworkFile(config, filePath, 'en0');

            // Assert
            const contents = fs.readFileSync(filePath).toString();
            expect(contents).not.toContain('testing');
        });
    });

    describe('Configuration', () => {
        it('should return ip settings', async () => {
            // Act
            const response = await request(server['app']).get('/config/IPPlugin');
            const rtn = response.body;

            // Assert
            expect(response.status).toBe(200);
            expect(rtn).toHaveProperty('gateway');
            expect(rtn).toHaveProperty('ipaddress');
            expect(rtn).toHaveProperty('dns');
            expect(rtn).toHaveProperty('dhcp');
            expect(rtn).toHaveProperty('prefix');
        });

        describe('gateway', () => {
            it('should handle non-existent gateway', () => {
                // Arrange
                GATEWAY_STATUS = false

                // Assert
                expect(plugin.configuration.gateway.value).toBe(undefined);
            });

            it('should handle gateway', () => {
                // Arrange
                GATEWAY_STATUS = true

                // Assert
                expect(plugin.configuration.gateway.value).toBe(GATEWAY_IP);
            });
        });

        describe('internetStatus', () => {
            let internetPollTime: any;

            beforeEach(async () => {
                internetPollTime = (await request(server['app']).get('/config/IPPlugin')).body.internetPollMs.value;
                await new Promise((res) => setTimeout(res, internetPollTime))
            })

            it('should return retrieve internetStatus', async () => {
                // Act
                const response = await request(server['app']).get('/config/IPPlugin');

                // Assert
                expect(response.body).toHaveProperty('internetStatus')
            });

            it('should return false if internet is reachable after waiting for the server to check', async () => {
                // Arrange
                GOOGLE_STATUS = false;

                // Act
                await new Promise((res) => setTimeout(res, internetPollTime))
                const response = await request(server['app']).get('/config/IPPlugin');

                // Assert
                expect(response.body.internetStatus.value).toBeFalsy()
            });

            it('should return true if internet is reachable after waiting for the server to check', async () => {
                // Arrange
                GOOGLE_STATUS = true;

                // Act
                await new Promise((res) => setTimeout(res, internetPollTime))
                const response = await request(server['app']).get('/config/IPPlugin');

                // Assert
                expect(response.body.internetStatus.value).toBeTruthy()
            });
        });
    });
});
