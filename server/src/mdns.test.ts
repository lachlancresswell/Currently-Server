import { Mdns } from "./mdns";

const randomString = () => (Math.random() + 1).toString(36).substring(7);

describe("MDNS", () => {

    describe("Packet validation", () => {
        let mdns = new Mdns();

        it("A packet type of SRV and the default HTTP service names should be valid", () => {
            let packet = [{ type: 'SRV', name: mdns.options.HTTP_MDNS_SERVICE_NAME! }];
            expect(mdns.validatePacket(packet)).toBe(true);
            packet = [{ type: 'SRV', name: mdns.options.HTTPS_MDNS_SERVICE_NAME! }];
            expect(mdns.validatePacket(packet)).toBe(true);
        });

        it("A packet without a type of SRV should be invalid", () => {
            let packet = [{ type: 'WASD', name: mdns.options.HTTP_MDNS_SERVICE_NAME! }];
            expect(mdns.validatePacket(packet)).toBe(false);
            packet = [{ type: 'WASD', name: mdns.options.HTTPS_MDNS_SERVICE_NAME! }];
            expect(mdns.validatePacket(packet)).toBe(false);
        });

        it("A packet with the incorrect service name should be invalid", () => {
            let packet = [{ type: 'SRV', name: randomString() }];
            expect(mdns.validatePacket(packet)).toBe(false);
        })

        it("A packet with the default non-HTTP/S service name should be valid", () => {
            let packet = [{ type: 'SRV', name: mdns.options.SERVICE_NAME! }];
            expect(mdns.validatePacket(packet)).toBe(true);
        })

        it("A packet with a non-default service names configured should be valid", () => {
            const HTTP_name = randomString();
            const HTTPS_name = randomString();
            const SERVICE_name = randomString();
            let mdns = new Mdns({
                HTTP_MDNS_SERVICE_NAME: HTTP_name,
                HTTPS_MDNS_SERVICE_NAME: HTTPS_name,
                SERVICE_NAME: SERVICE_name
            });
            let packet = [{ type: 'SRV', name: HTTP_name }];
            expect(mdns.validatePacket(packet)).toBe(true);
            packet[0].name = HTTPS_name;
            expect(mdns.validatePacket(packet)).toBe(true);
            packet[0].name = SERVICE_name;
            expect(mdns.validatePacket(packet)).toBe(true);
            mdns.end();
        })
    });

    describe("Sending Updates", () => {
        const ips = ['10.20.40.10'];

        it("Updates should be loopedback", (done: any) => {
            let mdns = new Mdns();

            const deviceName = randomString();

            const listener = (response: any) => {
                if (response.answers[2].name.indexOf(deviceName) >= 0) {
                    expect(response.answers.length).toBe(4);
                    mdns.removeResponseListener(listener);
                    mdns.end();
                    done();
                }
            }

            mdns.attachResponseHandler(listener)
            mdns.sendUpdate(ips, deviceName, '1821.68.34.a');
        });

        it("Update with default options should be recieved correctly", (done: any) => {

            let mdns = new Mdns();
            const deviceName = randomString();

            const listener = (response: any) => {
                if (response.answers[2].name.indexOf(deviceName) >= 0) {
                    expect(response.answers.length).toBe(4);
                    expect(response.answers[0].name).toBe(mdns.options.HTTP_MDNS_SERVICE_NAME);
                    expect(response.answers[0].type).toBe(mdns.options.MDNS_RECORD_TYPE);
                    expect(response.answers[1].name).toBe(mdns.options.HTTPS_MDNS_SERVICE_NAME);
                    expect(response.answers[1].type).toBe(mdns.options.MDNS_RECORD_TYPE);
                    expect(response.answers[2].name).toBe(deviceName + mdns.options.MDNS_DOMAIN);
                    expect(response.answers[2].type).toBe('A');
                    expect(response.answers[3].name).toBe('modbus' + mdns.options.MDNS_DOMAIN);
                    expect(response.answers[3].type).toBe('A');

                    mdns.removeResponseListener(listener);
                    mdns.end()
                    done();
                }
            }

            mdns.attachResponseHandler(listener)
            mdns.sendUpdate(ips, deviceName, '1821.68.34.a');
        });

        it("Update with unique options should be recieved correctly", (done: any) => {

            const HTTP_MDNS_SERVICE_NAME = randomString();
            const HTTPS_MDNS_SERVICE_NAME = randomString();
            const deviceName = randomString();
            const MDNS_DOMAIN = randomString();
            const modbusIP = '192.168.8.25';

            let mdns = new Mdns({
                HTTP_MDNS_SERVICE_NAME,
                HTTPS_MDNS_SERVICE_NAME,
                MDNS_DOMAIN
            });

            const listener = (response: any) => {
                expect(response.answers.length).toBe(4);
                expect(response.answers[0].name).toBe(HTTP_MDNS_SERVICE_NAME);
                expect(response.answers[1].name).toBe(HTTPS_MDNS_SERVICE_NAME);
                expect(response.answers[2].name).toBe(deviceName + MDNS_DOMAIN);
                expect(response.answers[2].type).toBe('A');
                expect(response.answers[2].data).toBe(ips[0]);
                expect(response.answers[3].name).toBe('modbus' + MDNS_DOMAIN);
                expect(response.answers[3].type).toBe('A');
                expect(response.answers[3].data).toBe(modbusIP);

                mdns.removeResponseListener(listener);

                mdns.end();
                done();
            }

            mdns.attachResponseHandler(listener)

            mdns.sendUpdate(ips, deviceName, modbusIP);
        });

        it("Update without modbus gateway IP should default to 0.0.0.0", (done: any) => {
            let mdns = new Mdns();
            const deviceName = randomString();

            const listener = (response: any) => {
                if (response.answers[2].name.indexOf(deviceName) >= 0) {
                    expect(response.answers[3].data).toBe('0.0.0.0');

                    mdns.removeResponseListener(listener);
                    mdns.end();
                    done();
                }
            }

            mdns.attachResponseHandler(listener)
            mdns.sendUpdate(ips, deviceName);
        });
    });

    describe("Performing Queries", () => {

        it('Query with default options should be received', (done: any) => {
            let mdns = new Mdns();

            const listener = (query: any) => {
                expect(query.questions[0].name).toBe(mdns.options.SERVICE_NAME)
                expect(query.questions[0].type).toBe('SRV')
                mdns.removeQueryListener(listener);
                mdns.end();
                done();
            }

            mdns.attachQueryHandler(listener)
            mdns.sendQuery()
        });

        it('Query with unique options should be received', (done: any) => {
            const SERVICE_NAME = randomString();

            let mdns = new Mdns({ SERVICE_NAME });

            const listener = (query: any) => {
                expect(query.questions[0].name).toBe(SERVICE_NAME)
                mdns.removeQueryListener(listener);
                mdns.end();
                done();
            }

            mdns.attachQueryHandler(listener)
            mdns.sendQuery()
        });

    });
});
