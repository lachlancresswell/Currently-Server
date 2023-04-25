import { execSync } from 'child_process';
import IPPlugin, { Address } from '../../ip-plugin';
import fs from 'fs';
import request from 'supertest';
import { Server } from '../../server';
import * as os from 'os';

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
 * Mocks the dns module to return a DNS server configuration of our choosing.
 */
jest.mock('dns', () => {
    return {
        getServers: jest.fn(() => {
            return DNS_SERVERS;
        })
    }
})

let DHCP_STATUS = true;
let GATEWAY_STATUS = true;

/**
 * Mocks the child_process module to return a network configuration of our choosing.
 */
jest.mock("child_process", () => {
    return {
        exec: jest.fn((cmd: string, cb: (err: any, stdout: any, stderr: any) => void) => {
            if (cmd.includes('ip route | grep default')) {

                cb(undefined, '192.168.64.1', undefined)
            } else {
                cb(undefined, '', undefined);
            }
        }),
        execSync: jest.fn((cmd: string) => {
            if (cmd.includes('ip route')) {
                let str = '';
                if (GATEWAY_STATUS) {
                    str += `default via 192.168.64.1 dev enp0s1 proto dhcp metric 100`

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
        server = new Server('./__tests__/ipplugin-plugin-config.json');
        plugin = server['pluginLoader']['plugins'][0] as any;
    });

    afterEach(async () => {
        plugin.unload();
        await server.end();
    });

    it('should create a valid .network file', async () => {
        const config: Address = {
            internal: false,
            dhcp: false,
            ipaddress: '192.168.1.100',
            prefix: 24,
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4']
        };

        TestPlugin.publicCreateNetworkFile(config, filePath);

        expect(fs.existsSync(filePath)).toBeTruthy();
        fs.unlinkSync(filePath)
        expect(fs.existsSync(filePath)).not.toBeTruthy();
    });

    it('an existing .network file should be deleted and replaced', async () => {

        fs.writeFileSync(filePath, 'testing')
        expect(fs.existsSync(filePath)).toBeTruthy();
        let contents = fs.readFileSync(filePath).toString();
        expect(contents).toContain('testing');

        const config: Address = {
            internal: false,
            dhcp: false,
            ipaddress: '192.168.1.100',
            prefix: 24,
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4']
        };

        TestPlugin.publicCreateNetworkFile(config, filePath);

        contents = fs.readFileSync(filePath).toString();
        expect(contents).not.toContain('testing');
        fs.unlinkSync(filePath)
        expect(fs.existsSync(filePath)).not.toBeTruthy();
    });

    it('should create a valid .network file from a PUT request', async () => {

        const newOptions = {
            "ipaddress": {
                "priority": 1,
                "display": true,
                "readableName": "ipaddress",
                "type": "ipaddress",
                "value": DEVICE_IP
            },
            "gateway": {
                "priority": 1,
                "display": true,
                "readableName": "gateway",
                "type": "ipaddress",
                "value": randomIp()
            },
            "prefix": {
                "priority": 1,
                "display": true,
                "readableName": "prefix",
                "type": "number",
                "value": randomPrefix()
            },
            "dhcp": {
                "priority": 1,
                "display": false,
                "readableName": "dhcp",
                "type": "boolean",
                "value": false
            },
            "dns": {
                "priority": 1,
                "display": true,
                "readableName": "dns",
                "type": "strings",
                "value": DNS_SERVERS
            },
            "iface": {
                "priority": 1,
                "display": true,
                "readableName": "Interface",
                "type": "string",
                "value": "enp0s1"
            },
            "filePath": {
                "priority": 1,
                "display": true,
                "readableName": "Systemd Config Filepath",
                "type": "string",
                "value": "/etc/systemd/network/20-wired.network"
            }
        }

        if (fs.existsSync(newOptions.filePath.value)) fs.unlinkSync(newOptions.filePath.value)

        const response = await request(server['app'])
            .put('/config/IPPlugin')
            .send(newOptions);

        expect(response.status).toBe(200);
        expect(execSync).toHaveBeenCalled();
        expect(os.networkInterfaces).toHaveBeenCalled();
        expect(fs.existsSync(newOptions.filePath.value)).toBeTruthy();
        const contents = fs.readFileSync(newOptions.filePath.value).toString();
        expect(contents).toContain(`${newOptions.ipaddress.value}/${newOptions.prefix.value}`)
        expect(contents).toContain(newOptions.gateway.value)
        expect(contents).toContain(newOptions.dns.value.join(' '))
        fs.unlinkSync(newOptions.filePath.value)
        expect(fs.existsSync(newOptions.filePath.value)).not.toBeTruthy();
    });

    it('should create a valid .network file with address info missing if dhcp is set to true from a PUT request', async () => {

        DHCP_STATUS = false;

        const newOptions = {
            "ipaddress": {
                "priority": 1,
                "display": true,
                "readableName": "ipaddress",
                "type": "ipaddress",
                "value": DEVICE_IP
            },
            "gateway": {
                "priority": 1,
                "display": true,
                "readableName": "gateway",
                "type": "ipaddress",
                "value": randomIp()
            },
            "prefix": {
                "priority": 1,
                "display": true,
                "readableName": "prefix",
                "type": "number",
                "value": randomPrefix()
            },
            "dhcp": {
                "priority": 1,
                "display": false,
                "readableName": "dhcp",
                "type": "boolean",
                "value": true
            },
            "dns": {
                "priority": 1,
                "display": true,
                "readableName": "dns",
                "type": "strings",
                "value": DNS_SERVERS
            },
            "iface": {
                "priority": 1,
                "display": true,
                "readableName": "Interface",
                "type": "string",
                "value": "enp0s1"
            },
            "filePath": {
                "priority": 1,
                "display": true,
                "readableName": "Systemd Config Filepath",
                "type": "string",
                "value": "/etc/systemd/network/20-wired.network"
            }
        }

        if (fs.existsSync(newOptions.filePath.value)) fs.unlinkSync(newOptions.filePath.value)

        const response = await request(server['app'])
            .put('/config/IPPlugin')
            .send(newOptions);

        expect(response.status).toBe(200);
        expect(execSync).toHaveBeenCalled();
        expect(os.networkInterfaces).toHaveBeenCalled();
        expect(fs.existsSync(newOptions.filePath.value)).toBeTruthy();
        const contents = fs.readFileSync(newOptions.filePath.value).toString();
        expect(contents).not.toContain(`${newOptions.ipaddress.value}/${newOptions.prefix.value}`)
        expect(contents).not.toContain(newOptions.gateway.value)
        expect(contents).not.toContain(newOptions.dns.value.join(' '))
        fs.unlinkSync(newOptions.filePath.value)
        expect(fs.existsSync(newOptions.filePath.value)).not.toBeTruthy();
    });

    test('should return ip settings', async () => {

        const response = await request(server['app']).get('/config/IPPlugin');
        const rtn = response.body;
        expect(response.status).toBe(200);
        expect(rtn).toHaveProperty('gateway');
        expect(rtn).toHaveProperty('ipaddress');
        expect(rtn).toHaveProperty('dns');
        expect(rtn).toHaveProperty('dhcp');
        expect(rtn).toHaveProperty('prefix');
    });

    test('should handle gateway not being set', () => {
        plugin.unload();
        server.end()

        GATEWAY_STATUS = false
        server = new Server('./__tests__/ipplugin-plugin-config.json');
        plugin = server['pluginLoader']['plugins'][0] as any;

        expect(plugin.configuration.gateway.value).toBe(undefined);
    });

});
