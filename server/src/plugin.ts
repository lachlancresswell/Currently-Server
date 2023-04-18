import { EventEmitter } from 'events';
import { Routing } from './server';
import * as moment from 'moment-timezone';
import { RequestHandler } from 'express';
import { ConfigArray, ConfigVariableMetadata } from '../../Types';

type method = 'GET' | 'POST' | 'ALL' | 'PUT';

// Interfaces
export interface Route {
    path: string;
    type: method;
    handler: RequestHandler;
}

// Plugin Class
/**
 * A generic class to be extended by plugins to provide unique features to the server.
 * @extends EventEmitter
 */
export abstract class Plugin<T> extends EventEmitter {
    protected routes: Route[] = [];
    public configuration: T = {} as T;
    protected serverRouter: Routing;
    public name = 'plugin';

    /**
     * Constructor for the Plugin class.
     * @param {Router} serverRouter - The express Router object passed from the server.
     */
    constructor(serverRouter: Routing, options: ConfigArray) {
        super();
        this.serverRouter = serverRouter;

        if (options) {
            this.loadInitialConfiguration(options);
        }
    }

    /**
     * Method for loading the plugin.
     */
    public load(): void { };

    /**
     * Method for unloading the plugin.
     */
    public unload() { this.removeAllRoutes() };

    /**
     * Registers a route with the server.
     * @param {string} path - The path to register the route.
     * @param {method} type - The HTTP method of the route.
     * @param {RequestHandler} handler - The request handler for the route.
     */
    registerRoute = (path: string, type: method, handler: (req: any, res: any) => void): void => {
        const route: Route = { path, type, handler };
        this.routes.push(route);
        if (type === 'GET') {
            this.serverRouter.registerGetRoute(path, handler)
        } else if (type === 'POST') {
            this.serverRouter.registerPostRoute(path, handler)
        } else if (type === 'ALL') {
            this.serverRouter.registerAllRoute(path, handler)
        } else if (type === 'PUT') {
            this.serverRouter.registerPutRoute(path, handler)
        }
    }

    /**
     * De-registers all registered routes.
     */
    deregisterRoutes(): void {
        this.routes.forEach((route) => this.removeRoute(route.type, route.path));
    }

    /**
     * Removes the route from the server based on the provided HTTP method and path.
     * @param {method} method - The HTTP method of the route to remove.
     * @param {string} path - The path of the route to remove.
     */
    removeRoute(method: method, path: string): void {
        this.routes = this.routes.filter((route) => route.type !== method || route.path !== path);
        this.serverRouter.removeRoute(path);
    }

    /**
     * Removes all registered plugin routes from the server.
     */
    removeAllRoutes = () => {
        this.routes = this.routes.filter((route) => {
            this.serverRouter.removeRoute(route.path);
            return false;
        })
    }

    /**
     * 
     * @param target 
     * @param req 
     * @param res 
     * @returns 
     */
    public registerProxy = (sourcePath: string, targetDomain: string, targetPort: string | number = '80') => {
        this.serverRouter.registerProxy(sourcePath, targetDomain, targetPort)
    }

    /**
     * Loads the initial configuration for the plugin.
     */
    protected loadInitialConfiguration(options: { [key: string | number]: ConfigVariableMetadata<any> }): void {
        for (const key in options) {
            const variable = options[key];
            this.addConfigVariable(key, variable, variable.value);
        }
    }


    /**
     * Adds a configuration variable with its metadata.
     * @param {string} key - The key of the configuration variable.
     * @param {ConfigVariableMetadata} metadata - The metadata object associated with the configuration variable.
     * @param {any} value - The initial value of the configuration variable.
     */
    addConfigVariable(key: string, metadata: ConfigVariableMetadata<any>, value: any): boolean {
        try {
            if (Plugin.validateValue(metadata, value)) {
                (this.configuration as any)[key] = { ...metadata, value };
                console.log(`${this.name} - Added ${key} as ${value}`)
                return true;
            }
        } catch (e) {
            console.log(e)
        }
        return false;
    }

    /**
     * Updates the value of a configuration variable after validating the new value.
     * @param {string} key - The key of the configuration variable.
     * @param {any} value - The new value of the configuration variable.
     * @returns {boolean} True if the new value is valid, otherwise false.
     */
    updateConfigVariable(key: string, value: any, save = true): boolean {
        const metadata = (this.configuration as any)[key];

        try {
            if (Plugin.validateValue(metadata, value)) {
                (this.configuration as any)[key].value = value;

                console.log(`${this.name} - Updated ${key} as ${value}`)

                if (save) this.emit('configUpdated', key, value);
                return true;
            }
        } catch (e) {
            throw (e)
        }
        return false;
    }

    /**
     * Validates the new value based on the type and constraints defined in the metadata.
     * @param {ConfigVariableMetadata} metadata - The metadata object associated with the configuration variable.
     * @param {any} value - The value itself to be stored.
     * @returns {boolean} True if the new value is valid, otherwise false.
     */
    static validateValue(metadata: ConfigVariableMetadata<any>, value: any): boolean {

        // Additional validation based on type
        switch (metadata.type) {
            case 'number':
                if (metadata.min !== undefined && value < metadata.min) throw (`${value} is less than minimum allowed.`)
                if (metadata.max !== undefined && value > metadata.max) throw (`${value} is larger than maximum allowed.`)
                if (typeof value !== metadata.type) throw (`${value} is not a number.`)
                break;
            case 'boolean':
                if (typeof value !== metadata.type) throw (`${value} is not a boolean.`)
                break;
            case 'string':
                if (metadata.options && !metadata.options.includes(value)) throw (`${value} is not a listed option.`)
                if (typeof value !== metadata.type) throw (`${value} is not a string.`)
                break;
            case ('timezone' as string):
                if (!Plugin.validateTimezone(value)) throw (`${value} is not a valid timezone.`)
                break;
            case ('ipaddress' as string):
                if (!Plugin.validateIPAddress(value)) throw (`${value} is not a valid ip address.`);
                break;
        }
        return true;
    }

    /**
   * Validates if the given value is a valid timezone.
   * @param {string} value - Timezone in string format.
   * @returns {boolean} True if the value is a valid timezone, otherwise false.
   */
    static validateTimezone(value: string): boolean {
        return moment.tz.zone(value) !== null;
    }

    /**
     * Validates if the given value is a valid IP address (IPv4 or IPv6).
     * @param address - Either IPv4 or IPv6 address in string format
     * @returns - True if the value is a valid IP address, otherwise false.
     */
    static validateIPAddress(address: string): boolean {
        const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

        return ipv4Pattern.test(address) || ipv6Pattern.test(address);
    }
}
