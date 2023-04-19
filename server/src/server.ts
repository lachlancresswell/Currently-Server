// Server.ts
import express, { Express, Request, Response } from 'express';
import { PluginLoader } from './plugin-loader';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import httpProxy from 'http-proxy';

export interface Routing {
    registerGetRoute: (path: string, handler: (req: Request, res: Response) => void) => void;
    registerPostRoute: (path: string, handler: (req: Request, res: Response) => void) => void;
    registerAllRoute: (path: string, handler: (req: Request, res: Response) => void) => void;
    registerPutRoute: (path: string, handler: (req: Request, res: Response) => void) => void;
    removeRoute: (path: string) => void;
    registerProxy: (sourcePath: string, targetDomain: string, targetPort: string | number) => void;
}

const HTTP_PORT = process.env.NODE_ENV === 'test' ? 0 : 8001;
const HTTPS_PORT = process.env.NODE_ENV === 'test' ? 0 : 8002;

/**
 * Server class for hosting the application.
 */
export class Server {
    protected app: Express;
    protected pluginLoader: PluginLoader;
    protected httpServer: http.Server;
    protected httpsServer?: https.Server;
    protected httpProxy: httpProxy;
    public Router: Routing;

    /**
     * Server constructor.
     * @param configFilePath - Path to the plugin configuration file
     */
    constructor(private configFilePath: string) {
        this.app = express();

        this.Router = {
            registerGetRoute: this.registerGetRoute.bind(this),
            registerPostRoute: this.registerPostRoute.bind(this),
            registerAllRoute: this.registerAllRoute.bind(this),
            registerPutRoute: this.registerPutRoute.bind(this),
            removeRoute: this.removeRoute.bind(this),
            registerProxy: this.registerProxy.bind(this),
        };

        this.httpServer = http.createServer(this.app);
        if (fs.existsSync(path.join(__dirname, '../../../key.pem')) && fs.existsSync(path.join(__dirname, '../../../cert.pem'))) this.httpsServer = https.createServer({
            key: fs.readFileSync(path.join(__dirname, '../../../key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../../../cert.pem')),
        }, this.app);

        this.httpServer.listen(HTTP_PORT, () => {
            console.log(`HTTP server started on port ${HTTP_PORT}`);
        });

        if (this.httpsServer) this.httpsServer.listen(HTTPS_PORT, () => {
            console.log(`HTTPS server started on port ${HTTPS_PORT}`);
        });

        this.httpProxy = httpProxy.createProxyServer();

        this.app.use(express.static(path.join(__dirname, '..', 'client-react', 'distro-ui', 'build')));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.pluginLoader = new PluginLoader(configFilePath, this.Router);
        this.pluginLoader.loadPlugins();
    }

    /**
     * Closes all ports and finishes the server.
     * @returns Promise<void>
     */
    public end = async (): Promise<void[]> => {
        const proms: Promise<void>[] = [];
        if (this.httpServer) {
            const p = new Promise<void>((resolve) => {
                this.httpServer.removeAllListeners();
                this.httpServer.close(() => resolve());
            });
            proms.push(p);
        }

        if (this.httpsServer) {
            const p = new Promise<void>((resolve) => {
                this.httpsServer!.removeAllListeners();
                this.httpsServer!.close(() => resolve());
            });
            proms.push(p);
        }

        return Promise.all(proms);
    };

    /**
     * Registers a GET route with the server.
     * @param path - The path for the GET route.
     * @param handler - The handler function for the GET route.
     */
    public registerGetRoute = (path: string, handler: (req: Request, res: Response) => void): void => {
        this.app.get(path, handler);
    };

    /**
     * Registers a POST route with the server.
     * @param path - The path for the POST route.
     * @param handler - The handler function for the POST route.
     */
    public registerPostRoute = (path: string, handler: (req: Request, res: Response) => void): void => {
        this.app.post(path, handler);
    };

    /**
     * Registers both a GET and POST route with the server.
     * @param path - The path for the POST route.
     * @param handler - The handler function for the POST route.
     */
    public registerAllRoute = (path: string, handler: (req: Request, res: Response) => void): void => {
        this.app.all(path, handler);
    };

    public registerPutRoute = (path: string, handler: (req: Request, res: Response) => void): void => {
        this.app.put(path, handler);
    };

    /**
     * Removes a route from the server.
     * @param path - The path of the route to remove.
     */
    public removeRoute = (path: string): void => {
        this.app._router.stack = this.app._router.stack.filter(
            (layer: any) => layer.path !== path
        );
    };

    registerProxy = (sourcePath: string, targetDomain: string, targetPort: string | number = '80') => {
        this.registerAllRoute(sourcePath, (req, res) => {
            let target = (req.socket as any).encrypted ? 'https://' : 'http://';
            target += `${targetDomain}:${targetPort}`;


            if (sourcePath.charAt(sourcePath.length - 1) === '*') {
                sourcePath = sourcePath.substring(0, sourcePath.length - 2);
            }
            req.url = req.url.substring(req.url.indexOf(sourcePath) + sourcePath.length);

            this.httpProxy.web(req, res, {
                target,
                secure: false // Prevents errors with self-signed certß
            }, (e: Error) => console.log(e))
        });
    };
}
