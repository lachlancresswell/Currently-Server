import { EventEmitter } from 'events';

export interface Options {
    [index: string]: any;
}

export class Instance {
    event: EventEmitter;
    options: Options;
    app: any;

    constructor(app: any, options?: {}) {
        this.app = app;
        this.event = new EventEmitter();
        this.options = {};
        // Overwrite default with user provided options
        Object.assign(this.options, options);

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
        return Promise.resolve();
    }

    announce = (name: string, ...args: any[]) => this.event.emit(name, args)
    listen = (name: string, cb: (...args: any[]) => void) => this.event.addListener(name, cb)
}
