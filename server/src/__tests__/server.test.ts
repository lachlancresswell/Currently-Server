// server.test.ts
import { Server, Routing } from '../server';
import request from 'supertest';
import express, { Request, Response } from 'express';

describe('Server', () => {
    let server: Server;

    beforeEach(() => {
        server = new Server('./test-plugin-config.json');
    })

    afterEach(async () => {
        await server.end()
    })

    test('registerGetRoute() registers a GET route', async () => {
        server.registerGetRoute('/test-get', (req: Request, res: Response) => {
            res.send('GET route works');
        });

        const response = await request(server['app']).get('/test-get');
        expect(response.status).toBe(200);
        expect(response.text).toBe('GET route works');
    });

    test('registerPostRoute() registers a POST route', async () => {
        server.registerPostRoute('/test-post', (req: Request, res: Response) => {
            res.send('POST route works');
        });

        const response = await request(server['app']).post('/test-post');
        expect(response.status).toBe(200);
        expect(response.text).toBe('POST route works');
    });
});
