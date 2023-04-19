import cp, { exec, execSync } from 'child_process';
import IPPlugin, { Address, IPOptions } from '../../ip-plugin';
import fs from 'fs';
import request from 'supertest';
import { Server } from '../../server';

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
            return `2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
                link/ether 42:85:ff:dd:82:53 brd ff:ff:ff:ff:ff:ff
                inet 192.168.64.4/24 brd 192.168.64.255 scope global dynamic noprefixroute enp0s1
                   valid_lft 50745sec preferred_lft 50745sec
                inet6 fdfc:b5bb:4718:11f6:347f:d2bb:644d:f114/64 scope global dynamic noprefixroute 
                   valid_lft 2591960sec preferred_lft 604760sec
                inet6 fe80::ee8f:3e9e:80e1:d47c/64 scope link noprefixroute 
                   valid_lft forever preferred_lft forever`
        }),
    }
});

let server: Server;

const defaultConfig = {
    filePath: {
        priority: 1,
        readableName: 'Transmit',
        type: 'string',
        value: './20-wired.network',
    },
}

class TestPlugin extends IPPlugin {
    publicServerRouter = this.serverRouter;
    public publicIpHandler = this.ipHandler;
    public publicGetIpHandler = this.getIpHandler;
    public static publicCreateNetworkFile = IPPlugin.createNetworkFile;

    constructor(serverRouter: any, options: any) {
        super(serverRouter, options);
        this.name = 'TestPlugin';
    }
}

describe('TestPlugin', () => {
    let plugin: TestPlugin;

    beforeEach(() => {
        server = new Server('./__tests__/ipplugin-plugin-config.json');
        plugin = new TestPlugin(server.Router!, defaultConfig);
        plugin.load();
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
            networkprefix: 24,
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4']
        };

        TestPlugin.publicCreateNetworkFile(config, defaultConfig.filePath.value);

        expect(fs.existsSync(defaultConfig.filePath.value)).toBeTruthy();
        fs.unlinkSync(defaultConfig.filePath.value)
        expect(fs.existsSync(defaultConfig.filePath.value)).not.toBeTruthy();
    });

    it('an existing .network file should be deleted and replaced', async () => {

        fs.writeFileSync(defaultConfig.filePath.value, 'testing')
        expect(fs.existsSync(defaultConfig.filePath.value)).toBeTruthy();
        let contents = fs.readFileSync(defaultConfig.filePath.value).toString();
        expect(contents).toContain('testing');

        const config: Address = {
            internal: false,
            dhcp: false,
            ipaddress: '192.168.1.100',
            networkprefix: 24,
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4']
        };

        TestPlugin.publicCreateNetworkFile(config, defaultConfig.filePath.value);

        contents = fs.readFileSync(defaultConfig.filePath.value).toString();
        expect(contents).not.toContain('testing');
        fs.unlinkSync(defaultConfig.filePath.value)
        expect(fs.existsSync(defaultConfig.filePath.value)).not.toBeTruthy();
    });

    it('should create a valid .network file from a POST request', async () => {
        const config: Address = {
            internal: false,
            dhcp: false,
            ipaddress: '192.168.1.100',
            networkprefix: 24,
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4']
        };


        const response = await request(server['app'])
            .post('/ip')
            .send(config);

        expect(response.status).toBe(200);
        expect(exec).toHaveBeenCalled();
        expect(fs.existsSync(defaultConfig.filePath.value)).toBeTruthy();
        const contents = fs.readFileSync(defaultConfig.filePath.value).toString();
        expect(contents).toContain(`${config.ipaddress}/${config.networkprefix}`)
        expect(contents).toContain(config.gateway)
        expect(contents).toContain(config.dns?.join())
        fs.unlinkSync(defaultConfig.filePath.value)
        expect(fs.existsSync(defaultConfig.filePath.value)).not.toBeTruthy();
    });

    test('should return ip settings', async () => {

        const response = await request(server['app']).get('/get-ip');
        const rtn = response.body;
        expect(response.status).toBe(200);
        expect(rtn).toHaveProperty('gateway');
        expect(rtn).toHaveProperty('ipaddress');
        expect(rtn).toHaveProperty('dns');
        expect(rtn).toHaveProperty('internal');
        expect(rtn).toHaveProperty('dhcp');
        expect(rtn).toHaveProperty('networkprefix');
    });

});
