export type ipaddress = string;
export type subnetmask = string;
export type prefix = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
export type timezone = string;

/**
 * Possible config value types that can be stored.
 */
export type ConfigValue = string | number | boolean | ipaddress | ipaddress[] | timezone | subnetmask | prefix | undefined;

/**
 * Plugin variable and it's related metadata
 */
export interface VariableMetadata<T> {
    priority?: number; // How high to display the variable in the user-facing UI.
    readableName?: string; // String representation used in the user-facing UI.
    type: string; // The type of value in string format.
    display?: boolean; // Whether or not the variable should be configurable from the frontend UI.
    restart?: false | 'plugin' | 'server' | 'device'; // Whether or not the plugin, server or device should be restarted when the value is changed.
    options?: T[]; // Array of options available to the user. Optionally used with a string type.
    max?: number; // Maximum value allowed. Used only for number type values.
    min?: number; // Minimum value allowed. Used only for number type values.
}

export interface ConfigVariableMetadata<T> extends VariableMetadata<T> {
    value?: T; // The value itself being stored.
}

export interface EphemeralVariableMetaData<T> extends ConfigVariableMetadata<T> {
    getter?: () => T | undefined;
    setter?: () => void;
}

export interface ConfigArray {
    [key: string | number]: ConfigVariableMetadata<ConfigValue>
};

/**
 * Plugin configuration interface.
 */
export interface PluginConfig {
    path: string; // Path to compiled .js file to load.
    enabled: boolean; // Whether the plugin is enabled or not.
    config?: ConfigArray; // Plugin-specific configuration.
}

/**
 * Format for the JSON file containing all plugin information
 */
export interface PluginJSON {
    [key: string]: PluginConfig
}