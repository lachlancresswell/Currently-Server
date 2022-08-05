import { Logger } from './log';

export class Instance {
    log: Logger;

    constructor(title = 'myPlugin') {
        this.log = new Logger(title);
    }

    load(): Promise<any> {
        return Promise.resolve();
    }

    unload(): Promise<any> {
        return Promise.resolve();
    }
}
