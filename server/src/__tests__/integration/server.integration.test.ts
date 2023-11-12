// server.test.ts
import { Server, Routing } from '../../server';
import { PluginLoader } from '../../plugin-loader'
import { Request, Response } from 'express';
import supertest from 'supertest';

describe('Server', () => {
    let pluginLoader: PluginLoader
    let server: Server;

    beforeEach(() => {
        server = new Server('./__tests__/plugin-config.test.json');
    })

    afterEach(async () => {
        await server.end()
    })

    test('loadPlugins should call loadPlugin for each enabled plugin in the config', async () => {
        pluginLoader = server['pluginLoader'];

        expect(pluginLoader['plugins'].length).toBeGreaterThanOrEqual(1)
    });

    test('registerGetRoute() registers a GET route', async () => {
        server.registerGetRoute('/test-get', (req: Request, res: Response) => {
            res.send('GET route works');
        });

        const response = await supertest(server['app']).get('/test-get');
        expect(response.status).toBe(200);
        expect(response.text).toBe('GET route works');
    });

    test('registerPostRoute() registers a POST route', async () => {
        server.registerPostRoute('/test-post', (req: Request, res: Response) => {
            res.send('POST route works');
        });

        const response = await supertest(server['app']).post('/test-post');
        expect(response.status).toBe(200);
        expect(response.text).toBe('POST route works');
    });
});
