import { Server, Routing } from '../../server'
import express, { Express, Request, Response } from 'express';

export const mockServerRouting: Routing = {
    registerGetRoute: jest.fn((path: string, handler: (req: any, res: any) => void) => console.log('registerGetRoute')),
    registerPostRoute: jest.fn((path: string, handler: (req: any, res: any) => void) => console.log('registerPostRoute')),
    registerAllRoute: jest.fn((path: string, handler: (req: any, res: any) => void) => console.log('registerPostRoute')),
    registerPutRoute: jest.fn((path: string, handler: (req: any, res: any) => void) => console.log('registerPutRoute')),
    removeRoute: jest.fn((path: string) => console.log('removeRoute')),
    registerProxy: jest.fn((sourcePath: string, targetDomain: string, targetPort: string | number) => console.log('registerProxy')),
    reloadPlugin: jest.fn((pluginName: string) => true),
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
            registerPutRoute: jest.fn(),
            removeRoute: jest.fn(),
            registerProxy: jest.fn(),
            reloadPlugin: jest.fn(),
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
