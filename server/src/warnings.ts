// Influx-plugin.ts
import { Plugin } from './plugin';
import { Routing } from './server';
import { WarningsOptions } from '../../Types';


/**
 * Influx plugin for forwarding requests to the Influx server.
 * @extends Plugin
 */
class Warnings extends Plugin<WarningsOptions> {
    name = 'warnings';
    /**
     * Influx plugin constructor.
     * @param serverRouter - Express Router object from the server
     * @param options - Influx plugin options containing port and domain information
     */
    constructor(serverRouter: Routing, options: WarningsOptions) {
        super(serverRouter, options);

    }

}

export default Warnings;