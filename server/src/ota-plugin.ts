import fs from 'fs';
import * as Plugin from './plugin'
import * as Server from './server'

interface Options extends Plugin.Options {
    id: Plugin.ClientOption<number>,
    name: Plugin.ClientOption<string>,
}

const defaultOptions: Options = {
    id: {
        priority: 0,
        readableName: 'IP Address',
        restart: 'restart-server',
        value: 1
    },
    name: {
        priority: 0,
        readableName: 'Mask',
        restart: 'restart-server',
        value: 'my-ota-device'
    },
}


export class plugin extends Plugin.Instance {
    options!: Options;

    constructor(app: Server.default, options?: Options, name?: string) {
        super(app, options, name, defaultOptions);
    }
}