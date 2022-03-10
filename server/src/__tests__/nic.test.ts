import * as NIC from '../nic';

describe("NICs", () => {
    it("Returns NIC address object", () => {
        let interfaces = NIC.getAddresses();
        expect(interfaces.length).toBeGreaterThan(0);
        interfaces.forEach((i: NIC.NicInfo) => {
            expect(i).toHaveProperty('name')
            expect(i).toHaveProperty('ip')
            expect(i).toHaveProperty('mask')
        })
    })
})