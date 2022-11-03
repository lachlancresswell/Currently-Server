import * as Plugin from '../plugin'
import * as IP from '../ip-plugin';
import * as Server from '../server'
import * as http from 'http';

jest.mock("../server");

const server = new Server.default({
    HTTP_PORT: 8200,
    HTTPS_PORT: 8210,
});

describe('IP plugin class initialisation', () => {

    // test('Should start without options passed and have default values set', () => {
    //     expect.assertions(1);
    //     const plugin = new IP.plugin(server)
    //     expect(plugin.options.ip).toBe(IP.defaultOptions.ip);
    // });

    // test('should load', () => {
    //     expect.assertions(1);
    //     const plugin = new IP.plugin(server);
    //     const ip = IP.defaultOptions.ip?.value;

    //     plugin.load()

    //     expect(plugin.options.ip?.value).not.toBe(ip)
    // });

    // test('should set ip address via POST', () => {
    //     var post_options = {
    //         host: '127.0.0.1',
    //         port: '8200',
    //         path: '/ip_address',
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' }
    //     };

    //     // Set up the request
    //     var post_req = http.request(post_options, function (res) {
    //         res.setEncoding('utf8');
    //         res.on('data', function (chunk) {
    //             console.log('Response: ' + chunk);
    //         });
    //     });

    //     // post the data
    //     post_req.write(JSON.stringify({ 'ip_address': '127.0.0.1' }));
    //     post_req.end();
    // })

    // test('Should set IP address', async () => {
    //     const ip = '192.168.5.1';
    //     expect.assertions(2);
    //     const plugin = new IP.plugin(server)
    //     plugin.load()
    //     expect(plugin.options.ip?.value).not.toBe(ip)
    //     return plugin.setIp(ip).then(() => {
    //         plugin.getIps();
    //         expect(plugin.options.ip?.value).toBe(ip)
    //     })
    // });

    test('Should enable dhcp', async () => {
        const enabled = true;
        const disabled = false;
        const ip_address = '192.168.64.4';
        const prefix = '16';

        expect.assertions(2);
        const plugin = new IP.plugin(server)
        plugin.load()

        return plugin.setIp(disabled, ip_address, prefix).then(() => {
            plugin.getIps();
            // expect(plugin.options.dhcp?.value).toBe(disabled)
            // expect(plugin.options.ip?.value).toBe(ip_address)
            // expect(plugin.options.mask?.value).toBe(prefix)

            // return plugin.setIp(enabled).then(() => {
            // plugin.getIps();
            // expect(plugin.options.dhcp?.value).toBe(enabled)
            // })
        })
    });
});
