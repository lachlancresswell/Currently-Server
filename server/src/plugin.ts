import { EventEmitter } from 'events';
import { Routing } from './server';
import * as moment from 'moment-timezone';
import { RequestHandler } from 'express';
import { Request, Response } from 'express';
import { ConfigArray, ConfigValue, ConfigVariableMetadata, EphemeralVariableMetaData } from '../../Types';

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
    protected tasks: NodeJS.Timeout[] = [];
    public configuration: T = {} as T;
    protected serverRouter: Routing;
    public name = 'plugin';

    protected sort?: (keys: string[]) => string[];

    /**
     * Constructor for the Plugin class. Do not register routes here.
     * @param {Router} serverRouter - The express Router object passed from the server.
     */
    constructor(serverRouter: Routing, options: ConfigArray) {
        super();
        this.serverRouter = serverRouter;
        this.loadInitialConfiguration(options);
    }

    /**
     * Method for loading the plugin. Also called on reload. Register routes here.
     */
    public load(): void { };

    /**
     * Method for unloading the plugin.
     */
    public unload() {
        this.removeAllRoutes()
        this.removeAllTasks();
    };

    /**
     * Reloads the plugin.
     */
    public reload(): void {
        this.unload();
        this.load();
    }

    /**
     * Registers a route with the server.
     * @param {string} path - The path to register the route.
     * @param {method} type - The HTTP method of the route.
     * @param {RequestHandler} handler - The request handler for the route.
     */
    registerRoute = (path: string, type: method, handler: (req: Request, res: Response) => void): void => {
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
    public registerProxy = (sourcePath: string, targetDomain: string, targetPort: string | number = '80') => this.serverRouter.registerProxy(sourcePath, targetDomain, targetPort)

    /**
     * Loads the initial configuration for the plugin.
     */
    protected loadInitialConfiguration(options: { [key: string | number]: ConfigVariableMetadata<ConfigValue> }): void {
        for (const key in options) {
            const variable = options[key];

            // Don't set .value for ephemeral variables
            if (variable.value) {
                this.addConfigVariable(key, variable, variable.value);
            } else {
                (this.configuration as any)[key] = variable;
            }
        }
    }

    public restart = () => this.serverRouter.reloadPlugin(this.name);

    /**
     * Adds a configuration variable with its metadata.
     * @param {string} key - The key of the configuration variable.
     * @param {ConfigVariableMetadata} metadata - The metadata object associated with the configuration variable.
     * @param {any} value - The initial value of the configuration variable.
     */
    addConfigVariable(key: string, metadata: ConfigVariableMetadata<ConfigValue>, value: any): boolean {
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
     * @returns {'plugin' | 'server' | undefined} True if the new value is valid, otherwise false.
     */
    updateConfigVariable(key: string, value: any, save = true): 'plugin' | 'server' | undefined {
        const metadata = (this.configuration as ConfigArray)[key];

        let rtn: 'plugin' | 'server' | undefined;

        try {
            if (Plugin.validateValue(metadata, value)) {
                const existingValue = (this.configuration as ConfigArray)[key].value;

                // Check if the value is an array. If it is, compare stringified versions of the arrays.
                // Otherwise, compare the values directly.
                const valuesAreDifferent = Array.isArray(value) && Array.isArray(existingValue)
                    ? JSON.stringify(existingValue) !== JSON.stringify(value)
                    : existingValue !== value;

                if (valuesAreDifferent) {
                    (this.configuration as ConfigArray)[key].value = value;

                    console.log(`${this.name} - Updated ${key} as ${value}`)

                    if (save) this.emit('configUpdated', key, value);

                    rtn = (this.configuration as ConfigArray)[key].restart as 'plugin' | 'server';
                }
            }

        } catch (e) {
            throw (e)
        }
        return rtn;
    }

    updateEntireConfig(newConfig: ConfigArray, save = true) {
        let restart: 'plugin' | 'server' | undefined;
        let pluginsToRestart: string[] = []

        let keys = Object.keys(this.configuration as ConfigArray);

        if (this.sort) {
            keys = this.sort(keys)
        }

        keys.forEach((key) => {
            const curVariable = (this.configuration as ConfigArray)[key];
            const newVariable = newConfig[key];

            if (curVariable && newVariable && curVariable.value !== newVariable.value) {
                const rtn = this.updateConfigVariable(key, newVariable.value, save);

                switch (rtn) {
                    case 'plugin':
                        pluginsToRestart.push(key)
                        if (restart !== 'server') {
                            restart = 'plugin'
                        }
                        break;
                    case 'server':
                        restart = 'server';
                        break
                }
            }
        });

        return restart;
    }

    /**
     * Validates the new value based on the type and constraints defined in the metadata.
     * @param {ConfigVariableMetadata} metadata - The metadata object associated with the configuration variable.
     * @param {any} value - The value itself to be stored.
     * @returns {boolean} True if the new value is valid, otherwise false.
     */
    static validateValue(metadata: ConfigVariableMetadata<ConfigValue>, value: any): boolean {

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

    /**
     * Removes getter from object
     * @param obj object to remove getter from
     */
    static jsonConverter = <T>(obj: T) => {
        const properties = Object.getOwnPropertyNames(obj);
        const jsonObject: any = {};

        for (const property of properties) {
            jsonObject[property] = (obj as any)[property];
        }

        return jsonObject as T;
    }

    /**
    * Attaches getters and setters for an ephemeral variable
     * @param variable Ephermeral object to configure
     * @param getter Getter to attach to object
     * @param setter Optional setter to attach to object
     */
    setEphemeralVariable = (variable: EphemeralVariableMetaData<ConfigValue>, getter: () => any, setter?: (val: any) => void) => {
        if (setter) {
            Object.defineProperty(variable, "value", {
                get: getter,
                set: setter
            });
        } else {
            Object.defineProperty(variable, "value", {
                get: getter
            });
        }

        /**
         * Assigns a toJSON method to each ephemeral configuration parameter otherwise getters and setters will not be included in the JSON response.
         */
        variable.toJSON = () => Plugin.jsonConverter(variable);
    }

    /**
     * Schedules a task to be performed periodically
     * @param task Function to be performed periodically
     * @param ms Time in milliseconds between each execution
     */
    protected scheduleTask = (task: () => Promise<any>, ms: number) => {
        const interval = setInterval(task, ms); // poll every 5 seconds
        this.tasks.push(interval)
    }

    /**
     * Removes all tasks from the task list
     */
    protected removeAllTasks = () => {
        this.tasks = this.tasks.filter((interval) => {
            clearInterval(interval)
            return false;
        })
    }
}
