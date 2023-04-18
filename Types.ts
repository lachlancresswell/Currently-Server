/**
 * Possible values types that can be stored.
 */
export type ConfigValue = string | number | boolean | 'ipaddress' | 'timezone';

/**
 * Plugin variable and it's related metadata
 */
export interface ConfigVariableMetadata<T> {
    priority?: number; // How high to display the variable in the user-facing UI.
    readableName?: string; // String representation used in the user-facing UI.
    type: string; // The type of value in string format.
    value: T; // The value itself being stored.
    display?: boolean; // Whether or not the variable should be configurable from the frontend UI.
    options?: T[]; // Array of options available to the user. Optionally used with a string type.
    max?: number; // Maximum value allowed. Used only for number type values.
    min?: number; // Minimum value allowed. Used only for number type values.
    restart?: false | 'plugin' | 'server';
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