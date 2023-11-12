import IPPlugin, { Address } from '../../ip-plugin';
import fs from 'fs';
import { execSync } from 'child_process';

jest.mock('child_process', () => ({
    execSync: jest.fn(),
}));
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

describe('TestPlugin', () => {
    beforeAll(() => {
    });

    describe('createNetworkFile', () => {
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
            IPPlugin['createNetworkFile'](config, fp, 'eth0');

            // Assert
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.ipaddress!));
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.prefix!.toString()));
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.gateway!));
            expect(fs.writeFileSync).toHaveBeenCalledWith(fp, expect.stringContaining(config.dns![0]!));
        });
    });

    describe('getGatewayIP', () => {
        it('should return the default gateway IP address', () => {
            // Arrange
            const gatewayIP = '192.168.1.1';
            (execSync as jest.Mock).mockReturnValue(Buffer.from(`default via ${gatewayIP} dev eth0`));

            // Act
            const rtn = IPPlugin.getGatewayIP();

            // Assert
            expect(rtn).toEqual(gatewayIP);
        });

        it('should return the gateway IP address for a specific NIC', () => {
            // Arrange
            const expectedGatewayIP = '192.168.1.1';
            (execSync as jest.Mock).mockReturnValue(Buffer.from(`default via ${expectedGatewayIP} dev eth1` as any));

            // Act
            const actualGatewayIP = IPPlugin.getGatewayIP('eth1');

            // Assert
            expect(actualGatewayIP).toEqual(expectedGatewayIP);
            expect(execSync).toHaveBeenCalledWith('ip route show dev eth1');
        });

        it('should return undefined if no default gateway is found', () => {
            // Arrange
            (execSync as jest.Mock).mockReturnValue(Buffer.from(`` as any));

            // Act
            const actualGatewayIP = IPPlugin.getGatewayIP();

            // Assert
            expect(actualGatewayIP).toBeUndefined();
            expect(execSync).toHaveBeenCalledWith('ip route');
        });
    });
});
