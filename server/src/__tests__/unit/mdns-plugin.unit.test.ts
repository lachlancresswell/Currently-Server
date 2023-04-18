// MDNSPlugin.test.ts
/**
 * Some tests will fail unless run by themselves.
 */
import MDNSPlugin from '../../mdns-plugin';

describe('changing initial configuration variables should modify plugin behaviours', () => {
    test('getLocalIPAddresses should return an array of valid ip addresses', () => {
        const localIPAddresses = MDNSPlugin.getLocalIPAddresses();

        let i = 1;
        expect(localIPAddresses).toBeInstanceOf(Array);
        localIPAddresses.forEach((ip) => {
            expect(typeof ip.address).toBe('string');
            expect(typeof ip.local).toBe('boolean');
            expect(ip.address.split('.').length).toBe(4);
            i += 3;
        });
        expect.assertions(i)
    });

    test('getUniqueMacPortion should return a string', () => {
        const mac = MDNSPlugin.getUniqueMacPortion();

        expect(mac).toBeTruthy();
        expect(typeof (mac)).toEqual('string')
        expect(mac.length).toEqual(6)

        expect.assertions(3)
    })
})
