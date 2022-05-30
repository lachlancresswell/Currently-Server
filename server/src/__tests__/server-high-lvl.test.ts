import { mocked } from 'ts-jest/utils';
import * as Server from '../server'
import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';
import * as PluginLoader from '../plugin-loader'

jest.unmock('../server')
jest.unmock('express')

jest.setTimeout(12000)

const randomString = () => (Math.random() + 1).toString(36).substring(7);
function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('Methods', () => {
    let server: Server.default | null;
    let options: any;
    beforeEach(async () => {
        options = {
            hostname: 'localhost',
            port: 8200,
            path: '',
            method: 'GET',
        };

        server = new Server.default({
            HTTP_PORT: 8200,
        });
        await server.start();
    });
    afterEach(async () => {
        server?.end();
        server = null;
    });
    test('should get index', async () => {
        expect.assertions(1);

        const res: http.IncomingMessage = await new Promise((resolve) => http.request(options, res => resolve(res)).end());
        expect(res.statusCode).toEqual(200)
    });

    test('should get neighbours', async () => {
        expect.assertions(2);

        options.path = '/neighbours';

        const res: http.IncomingMessage = await new Promise((resolve) => http.request(options, res => resolve(res)).end());
        const ret: string = await new Promise((resolve) => res.on('data', d => resolve(d.toString())));
        expect(JSON.parse(ret)).toHaveProperty('addresses')
        expect(res.statusCode).toEqual(200)
    });

    // test('should get neighbour over proxy', async () => {
    //     expect.assertions(2);

    //     options.path = '/127.0.0.1/' + options.port;

    //     const res: http.IncomingMessage = await new Promise((resolve) => http.request(options, res => resolve(res)).end());
    //     const ret: string = await new Promise((resolve) => res.on('data', d => resolve(d.toString())));
    //     expect(JSON.parse(ret)).toHaveProperty('addresses')
    //     expect(res.statusCode).toEqual(200)
    // });

    test('should get config', async () => {
        expect.assertions(2);
        options.path = '/config';
        const res: http.IncomingMessage = await new Promise((resolve) => http.request(options, res => resolve(res)).end());
        const ret: string = await new Promise((resolve) => res.on('data', d => resolve(d.toString())));
        expect(JSON.parse(ret)).toHaveProperty('mdns')
        expect(res.statusCode).toEqual(200)
    });

    test('should get config sub value', async () => {
        expect.assertions(2);

        options.path = '/config/mdns';

        const res: http.IncomingMessage = await new Promise((resolve) => http.request(options, res => resolve(res)).end());
        const ret: string = await new Promise((resolve) => res.on('data', d => resolve(d.toString())));
        expect(JSON.parse(ret)).toHaveProperty('device_name')
        expect(res.statusCode).toEqual(200)
    });

    test('should post config', async () => {
        expect.assertions(3);

        const obj = { device_name: { restart: 1, readableName: 'Device Name', priority: 1, value: 'toodloo' } };
        const data = JSON.stringify(obj);

        const postOptions = {
            ...options, ...{
                path: '/config/mdns',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                },
            }
        };

        await new Promise((resolve) => {
            const req = http.request(postOptions, res => resolve(res))
            req.write(data);
            req.end()
        });

        options.path = '/config/mdns';
        const res: http.IncomingMessage = await new Promise((resolve) => http.request(options, res => resolve(res)).end());
        const ret: string = await new Promise((resolve) => res.on('data', d => resolve(d.toString())));
        expect(JSON.parse(ret)).toHaveProperty('device_name')
        expect(JSON.parse(ret).device_name).toEqual(obj.device_name)
        expect(res.statusCode).toEqual(200)
    });
});