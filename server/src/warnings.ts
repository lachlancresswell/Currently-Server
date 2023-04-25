// Influx-plugin.ts
import { Plugin } from './plugin';
import { Routing } from './server';
import { ConfigArray, ConfigVariableMetadata } from '../../Types';

/**
 * Options interface for the Influx plugin.
 */
export interface InfluxOptions extends ConfigArray {
    enable: ConfigVariableMetadata<boolean>;
    vSet: ConfigVariableMetadata<number>;
    vmax: ConfigVariableMetadata<number>;
    vmin: ConfigVariableMetadata<number>;
    amax: ConfigVariableMetadata<number>;
    HZset: ConfigVariableMetadata<number>;
    hzmax: ConfigVariableMetadata<number>;
    hzmin: ConfigVariableMetadata<number>;
}

/**
 * Influx plugin for forwarding requests to the Influx server.
 * @extends Plugin
 */
class Warnings extends Plugin<InfluxOptions> {
    name = 'warnings';
    /**
     * Influx plugin constructor.
     * @param serverRouter - Express Router object from the server
     * @param options - Influx plugin options containing port and domain information
     */
    constructor(serverRouter: Routing, options: InfluxOptions) {
        super(serverRouter, options);

    }

}

export default Warnings;