import fs from 'fs';
import * as Server from './server'
import fetch from 'node-fetch';

//jest.setTimeout(10000)

const randomString = () => (Math.random() + 1).toString(36).substring(7);
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

const server1 = new Server.Server({
    INFLUX_PORT: Server.INFLUX_PORT,
    CONFIG_PATH: Server.CONFIG_PATH,
    DEFAULT_DEVICE_NAME: randomString(),
    HTTP_PORT: randomNumber(2000, 9000),
    HTTPS_PORT: randomNumber(2000, 9000),
    HTTP_MDNS_SERVICE_NAME: Server.HTTP_MDNS_SERVICE_NAME,
    HTTPS_MDNS_SERVICE_NAME: Server.HTTPS_MDNS_SERVICE_NAME,
    MDNS_RECORD_TYPE: Server.MDNS_RECORD_TYPE,
    MDNS_DOMAIN: Server.MDNS_DOMAIN,
    SERVICE_NAME: Server.SERVICE_NAME
});

server1.start();

const server2 = new Server.Server({
    INFLUX_PORT: Server.INFLUX_PORT,
    CONFIG_PATH: Server.CONFIG_PATH + '-2.json',
    DEFAULT_DEVICE_NAME: randomString() + '-2',
    HTTP_PORT: randomNumber(2000, 9000),
    HTTPS_PORT: randomNumber(2000, 9000),
    HTTP_MDNS_SERVICE_NAME: Server.HTTP_MDNS_SERVICE_NAME,
    HTTPS_MDNS_SERVICE_NAME: Server.HTTPS_MDNS_SERVICE_NAME,
    MDNS_RECORD_TYPE: Server.MDNS_RECORD_TYPE,
    MDNS_DOMAIN: Server.MDNS_DOMAIN,
    SERVICE_NAME: Server.SERVICE_NAME
});

describe("App", () => {

    describe("HTTP Requests", () => {
        it('Gets index path', (done: any) => {
            const path = 'http://' + server1.nicAddresses[0].ip + ':' + server1.options.HTTP_PORT + '/';
            fetch(path).then((res: any) => {
                res.text().then((body: any) => {
                    expect(body.length).toBeGreaterThan(100)
                    done();
                });
            });
        })

        it('Gets neighbours path', (done: any) => {
            const path = 'http://' + server1.nicAddresses[0].ip + ':' + server1.options.HTTP_PORT + '/neighbours';
            const response = fetch(path).then((res: any) => {
                res.text().then((body: any) => {
                    expect(body.length).toBeGreaterThan(100)
                    done();
                });
            });
        })

        it('Gets influx path but errors', (done: any) => {
            const path = 'http://' + server1.nicAddresses[0].ip + ':' + server1.options.HTTP_PORT + '/influx/' + randomString();
            const response = fetch(path).then((res: any) => {
                res.text().then((body: any) => {
                    expect(body).toBe('Error: Influx server connection refused')
                    done();
                });
            });
        })

        it('Gets device name', (done: any) => {
            const path = 'http://' + server1.nicAddresses[0].ip + ':' + server1.options.HTTP_PORT + '/device-name/';
            fetch(path).then((res: any) => {
                res.text().then((body: any) => {
                    expect(JSON.parse(body)).toEqual(server1.config.Device.name);
                    done();
                });
            });
        })

        it('Updates device name via post', (done: any) => {

            const deviceName = randomString();
            const path = 'http://' + server1.nicAddresses[0].ip + ':' + server1.options.HTTP_PORT + '/device-name/' + deviceName;
            fetch(path, {
                method: 'POST',
                body: 'a=1',
                headers: {
                    'device-name': deviceName
                }
            }).then((res: any) => {
                res.text().then((body: any) => {
                    expect(JSON.parse(body)).toBe(deviceName)
                    done();
                });
            });
        })

        it('Resets device name via post', (done: any) => {

            const path = 'http://' + server1.nicAddresses[0].ip + ':' + server1.options.HTTP_PORT + '/device-name/';
            fetch(path, {
                method: 'POST',
                headers: {
                    'device-name': ''
                }
            }).then((res: any) => {
                res.text().then((body: any) => {
                    expect(JSON.parse(body)).toBe(server1.options.DEFAULT_DEVICE_NAME)
                    done();
                });
            });
        })
    })

    describe("Config", () => {
        it("Creates a new configuration file when one does not exist at the specified path", () => {
            const CONFIG_PATH = randomString() + '.json';

            expect(fs.existsSync(CONFIG_PATH)).toBeFalsy()
            const server = new Server.Server({
                INFLUX_PORT: randomNumber(2000, 10000),
                CONFIG_PATH,
                DEFAULT_DEVICE_NAME: randomString(),
                HTTP_PORT: randomNumber(2000, 10000),
                HTTPS_PORT: randomNumber(2000, 10000),
                HTTP_MDNS_SERVICE_NAME: randomString(),
                HTTPS_MDNS_SERVICE_NAME: randomString(),
                MDNS_RECORD_TYPE: Server.MDNS_RECORD_TYPE,
                MDNS_DOMAIN: Server.MDNS_DOMAIN,
                SERVICE_NAME: randomString()
            });

            expect(fs.existsSync(server.options.CONFIG_PATH)).toBeTruthy()
            fs.unlinkSync(CONFIG_PATH)
        })
    })

    describe("MDNS", () => {
        it("Advertises server", (done: any) => {
            const mdns = server1.MDNS;

            const listener = (query: any) => {
                expect(query.questions[0].name).toBe(mdns.options.SERVICE_NAME)
                expect(query.questions[0].type).toBe('SRV')
                mdns.removeQueryListener(listener);
                //mdns.end();
                server1.endDiscoveryLoop();
                done();
            }

            mdns.attachQueryHandler(listener)

            const ms = 3000
            server1.discoveryLoop(ms);
        })
    });



    describe("MDNS", () => {
        const ms = 3000;
        server1.discoveryLoop(ms);
        server2.discoveryLoop(ms);
        const listener = (server: Server.Server, otherServer: Server.Server, response: any, cb: any) => {
            if (response.answers[2].name.indexOf(otherServer.config.Device.name) >= 0) {
                expect(response.answers[2].name).toContain(otherServer.config.Device.name)
                expect(response.answers.length).toBeGreaterThanOrEqual(4);
                server.MDNS.removeResponseListener(listener);
                cb();
            }
        }
        it("Server 1 receives updates from server 2", (done: any) => {
            server1.MDNS.attachResponseHandler((res: any) => {
                listener(server1, server2, res, done)
            })
        })

        it("Server 2 receives updates from server 1", (done: any) => {
            server2.MDNS.attachResponseHandler((res: any) => {
                listener(server2, server1, res, () => {
                    // server1.MDNS.end();
                    // server2.MDNS.end();
                    server1.endDiscoveryLoop();
                    server2.endDiscoveryLoop();
                    done()
                })
            })
        })
    });
})
