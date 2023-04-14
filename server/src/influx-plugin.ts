// Influx-plugin.ts
import { Plugin, PluginConfiguration, ConfigVariableMetadata } from './plugin';
import { Routing } from './server';

/**
 * Options interface for the Influx plugin.
 */
export interface Options extends PluginConfiguration {
    INFLUX_PORT: ConfigVariableMetadata<number>;
    INFLUX_DOMAIN: ConfigVariableMetadata<string>;
}

/**
 * Influx plugin for forwarding requests to the Influx server.
 * @extends Plugin
 */
class Influx extends Plugin<Options> {

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