import * as Plugin from './plugin'

interface Options extends Plugin.Options {
    [index: number]: string;
}

export class plugin extends Plugin.Instance {
    options!: Options;

    constructor(app: any, options?: Options) {
        super(app);
    }
}