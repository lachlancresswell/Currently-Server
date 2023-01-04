import * as Server from '../server'
import * as Util from '../util-plugin';
import Path from 'path';

jest.mock("../server");

const MODULE_NAME = "util";

const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});

const randomString = () => (Math.random() + 1).toString(36).substring(7);

let util: Util.plugin | undefined;

describe('Util plugin class initialisation', () => {
    test('Should start with default values', async () => {
        util = new Util.plugin(server)
    });
});