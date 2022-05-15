import { mocked } from 'ts-jest/utils';
import * as Plugin from '../plugin';
import * as Server from '../server'

jest.mock("../server");

const server = new Server.default({
    HTTP_PORT: Server.HTTP_PORT,
    HTTPS_PORT: Server.HTTPS_PORT,
});

const randomString = () => (Math.random() + 1).toString(36).substring(7);
const randomNum = () => Math.ceil(Math.random() * 10000)
describe('Plugin class initialisation', () => {
    test('Should init without options passed and create an empty options object', async () => {
        let plugin = new Plugin.Instance(server);
        plugin.load();
        plugin.unload();
        expect(plugin.app).toBeTruthy();
        expect(plugin.event).toBeTruthy();
        expect(plugin.options).toEqual({});
    });

    test('Passed options object should be assigned', async () => {
        const options: Plugin.Options = {}
        const key = randomString();
        options[key] = randomString();

        let plugin = new Plugin.Instance(server, options);
        expect(plugin.app).toBeTruthy();
        expect(plugin.event).toBeTruthy();
        expect(plugin.options).toEqual(options);
    });

    test('Env vars should overwrite passed options and types should be maintained', async () => {
        const options: Plugin.Options = {}
        const strKey = randomString();
        const numKey = randomString();
        options[strKey] = randomString();
        options[numKey] = randomNum();
        process.env[strKey] = randomString();
        (process.env[numKey] as any) = randomNum();
        let obj: any = {};
        obj[strKey] = process.env[strKey];
        obj[numKey] = parseInt(process.env[numKey]!); // returns string

        let plugin = new Plugin.Instance(server, options);
        expect(plugin.app).toBeTruthy();
        expect(plugin.event).toBeTruthy();
        expect(plugin.options).toEqual(obj);
        expect(plugin.options).not.toEqual(options);
    });

    test('Announced events should be heard', async () => {
        let plugin = new Plugin.Instance(server);
        const event = randomString();
        const value = randomString();
        plugin.listen(event, (rec: string) => {
            expect(rec).toBeTruthy();
            expect(rec.length).toBeGreaterThan(0);
            expect(rec[0]).toEqual(value)
        })
        plugin.announce(event, value);
    });
});