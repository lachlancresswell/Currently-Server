// Influx-plugin.ts
import { Plugin } from './plugin';
import { Routing } from './server';
import { ConfigArray, ConfigVariableMetadata } from '../../Types';

/**
 * Options interface for the Influx plugin.
 */
export interface InfluxOptions extends ConfigArray {
    databasePort: ConfigVariableMetadata<number>;
    databaseDomain: ConfigVariableMetadata<string>;
    rxDelay: ConfigVariableMetadata<number>;
}

/**
 * Influx plugin for forwarding requests to the Influx server.
 * @extends Plugin
 */
class Influx extends Plugin<InfluxOptions> {

    /**
     * Influx plugin constructor.
     * @param serverRouter - Express Router object from the server
     * @param options - Influx plugin options containing port and domain information
     */
    constructor(serverRouter: Routing, options?: Options) {
        super(serverRouter, options);

        this.registerProxy("/influx/*", this.configuration.INFLUX_DOMAIN.value, this.configuration.INFLUX_PORT.value);
    }
}

export default Influx;