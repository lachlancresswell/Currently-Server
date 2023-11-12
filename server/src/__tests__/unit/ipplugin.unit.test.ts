import { spawnSync } from 'child_process';
import IPPlugin, { Address } from '../../ip-plugin';
import { exec } from 'child_process';
import fs from 'fs';

jest.mock('child_process');
jest.mock('fs');

const fp = './20-wired.network'

export const mockServerRouting = {
    registerGetRoute: jest.fn(),
    registerPostRoute: jest.fn(),
    registerAllRoute: jest.fn(),
    registerPutRoute: jest.fn(),
    removeRoute: (path: string) => console.log('removeRoute'),
    registerProxy: (sourcePath: string, targetDomain: string, targetPort: string | number) => console.log('registerProxy'),
}

// Test plugin implementation
class TestPlugin extends IPPlugin {
    publicServerRouter = this.serverRouter;
    public static publicCreateNetworkFile = IPPlugin.createNetworkFile;

    constructor(serverRouter: any, options: any) {
        super(serverRouter, options);
        this.name = 'TestPlugin';
    }
}

const options = {
    filePath: {
        type: 'string',
        value: fp,
    }
}

describe('TestPlugin', () => {
    let plugin: TestPlugin;

    beforeAll(() => {
        plugin = new TestPlugin(mockServerRouting, options);
    });

    describe('updateNetworkConfig()', () => {
        it('should create a valid .network file', async () => {
            const config: Address = {
                internal: false,
                dhcp: false,
                ipaddress: '192.168.1.100',
                networkprefix: 24,
                gateway: '192.168.1.1',
                dns: ['8.8.8.8', '8.8.4.4']
            };

            TestPlugin.publicCreateNetworkFile(config, fp, 'eth0');

            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.ipaddress!));
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.networkprefix!.toString()));
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.gateway!));
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.dns![0]!));
        });

        it('should register routes', () => {
            plugin.load();
            expect(plugin.publicServerRouter.registerPostRoute).toHaveBeenCalled()
            expect(plugin.publicServerRouter.registerPostRoute).toHaveBeenCalledWith('/ip', expect.anything())
            expect(plugin.publicServerRouter.registerGetRoute).toHaveBeenCalled();
            expect(plugin.publicServerRouter.registerGetRoute).toHaveBeenCalledWith('/get-ip', expect.anything())

            plugin.unload();
        });
    });
});
