import { EventEmitter } from 'events';
import * as Server from './server'
import * as core from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export type RestartOption = 'no-restart' | 'restart-plugin' | 'restart-server';

export interface ClientOption<Type> {
    priority: number, // 0 for not displayed in client page, values starting at 1 for how high it is displayed
    readableName: string, // Human readable name for var
    value: Type, // actual value
    restart: RestartOption, // 0 if no restart required, 1 if plugin restart required, 2 if server restart required
}

export interface Options<Type = any> {
    [index: string]: ClientOption<Type> | string | boolean | number | undefined;
}


export class Instance {
    event: EventEmitter;
    options: Options;
    app: Server.default;
    name: string;
    routes: string[];

    constructor(app: Server.default, options?: {}, name?: string, defaultOptions?: Options) {
        this.app = app;
        this.event = new EventEmitter();
        this.options = {};
        this.name = name || 'myPlugin';
        this.routes = [];
        // Overwrite default with user provided options
        Object.assign(this.options, options);
        if (defaultOptions) this.options = { ...defaultOptions, ...this.options }

        const _this = this;
        Object.keys(this.options).forEach((k: string) => {
            if (process.env[k]) {
                if (typeof _this.options[k] == 'number' && typeof process.env[k] == 'string') _this.options[k] = parseInt(process.env[k] as string)
                else _this.options[k] = process.env[k]
            }
        })
    }

    load() {
    }

    unload(): Promise<any> {
        this.removeRoutes();
        return Promise.resolve();
    }

    announce = (name: string, ...args: any[]) => this.event.emit(name, args)
    listen = (name: string, cb: (...args: any[]) => void) => this.event.addListener(name, cb)

    registerAllRoute = (path: string, cb: core.RequestHandler<core.ParamsDictionary, any, any, ParsedQs, Record<string, any>>) => {
        this.app.app.all(`${path}`, cb);
        this.routes?.push(path);
    }
    registerGetRoute = (path: string, cb: core.RequestHandler<core.ParamsDictionary, any, any, ParsedQs, Record<string, any>>) => {
        this.app.app.get(`${path}`, cb);
        this.routes?.push(path);
    }
    registerPostRoute = (path: string, cb: core.RequestHandler<core.ParamsDictionary, any, any, ParsedQs, Record<string, any>>) => {
        this.app.app.post(`${path}`, cb);
        this.routes?.push(path);
    }
    removeRoute = (routeName: string) => {
        const routes = this.app.app._router.stack;
        function removeMiddlewares(route: any, i: any, routes: any[]) {
            if (route.path === routeName) routes.splice(i, 1);
            else if (route.route) route.route.stack.forEach(removeMiddlewares);
        }
        routes.forEach(removeMiddlewares);
    }
    removeRoutes = () => {
        const routes = this.app.app._router.stack;
        function removeMiddlewares(t: Instance, route: any, i: any, routes: any[]) {
            let index = -1;
            t.routes.find((val, i) => {
                if (val === route.path) index = i;
                return val === route.path
            });
            if (index >= 0) {
                routes.splice(i, 1);
                t.routes.splice(index, 1);
            }
            else if (route.route) route.route.stack.forEach((route: any, i: number, routes: any[]) => removeMiddlewares(t, route, i, routes));
        }
        routes.forEach((route: any, i: number, routes: any[]) => removeMiddlewares(this, route, i, routes));
    }
}
