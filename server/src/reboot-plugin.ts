
import * as Plugin from './plugin';
import * as Server from './server'
import * as SetIp from 'set-ip-address'

export class plugin extends Plugin.Instance {
    options!: Plugin.Options;

    constructor(app: Server.default, options?: Plugin.Options, name?: string) {
        super(app, options, name);
    }

    reboot = () => require('reboot').rebootImmediately();
}