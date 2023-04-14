import { Server, Routing } from '../../server'
import express, { Express, Request, Response } from 'express';

export const mockServerRouting: Routing = {
    registerGetRoute: (path: string, handler: (req: any, res: any) => void) => console.log('registerGetRoute'),
    registerPostRoute: (path: string, handler: (req: any, res: any) => void) => console.log('registerPostRoute'),
    registerAllRoute: (path: string, handler: (req: any, res: any) => void) => console.log('registerPostRoute'),
    removeRoute: (path: string) => console.log('removeRoute'),
    registerProxy: (sourcePath: string, targetDomain: string, targetPort: string | number) => console.log('registerProxy'),
}

export default class MockServer {
    protected app?: Express;
    protected pluginLoader?: {};
    protected httpServer?: {
        listen: () => void;
        removeAllListeners: () => void;
        close: () => void;
    };
    protected httpsServer?: {};
    protected httpProxy?: {};
    public Router?: Routing;

    constructor(configFilePath: string) {
        this.Router = {
            registerGetRoute: jest.fn(),
            registerPostRoute: jest.fn(),
            registerAllRoute: jest.fn(),
            removeRoute: jest.fn(),
            registerProxy: jest.fn(),
        };

        // Mock the httpServer and httpsServer creation and listeners
        this.httpServer = {
            listen: jest.fn(),
            removeAllListeners: jest.fn(),
            close: jest.fn((callback: () => void) => callback()),
        } as any;

        this.httpsServer = {
            listen: jest.fn(),
            removeAllListeners: jest.fn(),
            close: jest.fn((callback: () => void) => callback()),
        } as any;

        // Mock the PluginLoader instance
        this.pluginLoader = {
            loadPlugins: jest.fn(),
        } as any;

        // Mock the httpProxy instance
        this.httpProxy = {
            web: jest.fn(),
        } as any;
    }

    // Mock the end method
}

export { MockServer };
