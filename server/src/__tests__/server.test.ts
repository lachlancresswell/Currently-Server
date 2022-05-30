import { mocked } from 'ts-jest/utils';
import * as Server from '../server'
import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';
import * as PluginLoader from '../plugin-loader'

jest.setTimeout(10000)
jest.mock('http');
jest.mock('https');
jest.mock('http-proxy');
jest.mock('express');
jest.mock('../plugin-loader', () => ({
    loadFromConfig: jest.fn(() => 'foo'),
    unload: jest.fn()
}));

http.createServer = jest.fn().mockImplementation(() => { return { listen: jest.fn() } });
https.createServer = jest.fn().mockImplementation(() => { return { listen: jest.fn() } });
httpProxy.createProxyServer = jest.fn();

const randomString = () => (Math.random() + 1).toString(36).substring(7);
function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('Class construction', () => {
    let server: Server.default | null;
    beforeEach(() => {

    });

    afterEach(() => {
        server?.end();
        server = null;
    });
    test('should start without options provided', async () => {
        expect.assertions(2);
        server = new Server.default();
        expect(server.options).toEqual(Server.defaultOptions);
        expect(httpProxy.createProxyServer).toHaveBeenCalled()
    });

    test('should start with options provided', async () => {
        expect.assertions(2);
        const options: Server.Options = {
            HTTP_PORT: randomInt(2000, 1000),
            HTTPS_PORT: randomInt(2000, 1000),
            ssl: { key: randomString(), cert: randomString() }
        }
        server = new Server.default(options);

        expect(server.options).toEqual(options);
        expect(httpProxy.createProxyServer).toHaveBeenCalled()
    });

    test('env vars should start overwrite provided options', async () => {
        expect.assertions(2);
        const options: Server.Options = {
            HTTP_PORT: randomInt(2000, 10000),
            HTTPS_PORT: randomInt(2000, 10000),
            ssl: { key: randomString(), cert: randomString() }
        }
        process.env.HTTP_PORT = randomInt(2000, 10000).toString();
        process.env.HTTPS_PORT = randomInt(2000, 10000).toString();
        process.env.SSL_KEY = randomString();
        process.env.SSL_CERT = randomString();

        server = new Server.default(options);
        expect(server.options).toEqual({
            HTTP_PORT: parseInt(process.env.HTTP_PORT),
            HTTPS_PORT: parseInt(process.env.HTTPS_PORT),
            ssl: {
                key: process.env.SSL_KEY,
                cert: process.env.SSL_CERT,
            }
        });
        expect(httpProxy.createProxyServer).toHaveBeenCalled()

        delete process.env.HTTP_PORT;
        delete process.env.HTTPS_PORT;
        delete process.env.SSL_KEY;
        delete process.env.SSL_CERT;
    });
});

describe('Methods', () => {
    let server: Server.default | null;
    afterEach(() => {
        server = null;
    });
    test('should start only HTTP server with default options', () => {
        expect.assertions(3);
        server = new Server.default();
        server.start();
        expect(server.options).toEqual(Server.defaultOptions);
        expect(http.createServer).toHaveBeenCalled();
        expect(https.createServer).not.toHaveBeenCalled();
    });

    test('should start both HTTP and HTTPS server with correct options', () => {
        expect.assertions(3);
        const options: Server.Options = {
            HTTP_PORT: randomInt(2000, 10000),
            HTTPS_PORT: randomInt(2000, 10000),
            ssl: { key: randomString(), cert: randomString() }
        }
        server = new Server.default(options);
        server.start();
        expect(server.options).toEqual(options);
        expect(http.createServer).toHaveBeenCalled();
        expect(https.createServer).toHaveBeenCalled();
    });

    test('should register endpoint', async () => {
        expect.assertions(1);
        server = new Server.default();
        server.registerGetRoute('mypath', (path) => expect(path).toEqual('mypath'));
    });
});