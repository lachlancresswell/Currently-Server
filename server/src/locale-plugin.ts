// Influx-plugin.ts
import { Plugin } from './plugin';
import { LocaleOptions } from '../../Types';
class LocalePlugin extends Plugin<LocaleOptions> {
    name = 'LocalePlugin';

    constructor(serverRouter: any, options: LocaleOptions) {
        super(serverRouter, options);
    }
}

export default LocalePlugin;