export type ipaddress = string;
export type subnetmask = string;
export type prefix = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
export type timezone = string;

/**
 * Possible config value types that can be stored.
 */
export type ConfigValue = string | number | boolean | ipaddress | ipaddress[] | timezone | subnetmask | prefix | Date | undefined;

/**
 * Plugin variable and it's related metadata
 */
export interface VariableMetadata<T> {
    priority?: number; // How high to display the variable in the user-facing UI.
    readableName?: string; // String representation used in the user-facing UI.
    key: string; // The key used to store the value in the config file.
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
    toJSON?: () => EphemeralVariableMetaData<T>;
}

export type ConfigVariable<T = any> = EphemeralVariableMetaData<T> | ConfigVariableMetadata<T>

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

export interface Neighbour {
    name: string; // Device name
    date: Date; // Date of last discovery
    address: ipaddress; // IP address of device
}

export interface PhaseData {
    voltage?: number,
    amperage?: number,
    phase: Phase,
}

export type Phase = 1 | 2 | 3;

export interface DistroData {
    time: Date,
    pf?: number,
    kva?: number,
    hz?: number,
    phases: PhaseData[]
}

/**
 * Options interface for the Warnings plugin.
 */
export interface WarningsOptions extends ConfigArray {
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
 * Options interface for the IP plugin.
 */
export interface IPOptions extends ConfigArray {
    filePath: ConfigVariableMetadata<string>;
    iface: ConfigVariableMetadata<string>;
    ipaddress: EphemeralVariableMetaData<ipaddress>;
    prefix: EphemeralVariableMetaData<prefix>;
    gateway: EphemeralVariableMetaData<ipaddress>;
    dns: EphemeralVariableMetaData<ipaddress[]>;
    dhcp: EphemeralVariableMetaData<boolean>;
    internetStatus: EphemeralVariableMetaData<boolean>;
    internetPollMs: ConfigVariableMetadata<number>;
}

/**
 * Options interface for the Locale plugin
 */
export interface LocaleOptions extends ConfigArray {
    locale: ConfigVariableMetadata<'au' | 'eu' | 'us' | 'ca'>;
}

export type DateType = 'dmy' | 'mdy'
export type TimeType = '24h' | '12h'

/**
 * Options interface for the Timezone plugin.
 */
export interface TZOptions extends ConfigArray {
    date: EphemeralVariableMetaData<string>;
    time: EphemeralVariableMetaData<string>;
    timezoneCountry: EphemeralVariableMetaData<timezone>;
    timezone: EphemeralVariableMetaData<timezone>;
    ntpServers: EphemeralVariableMetaData<string[]>;
    dateFormat: ConfigVariableMetadata<DateType>;
    timeFormat: ConfigVariableMetadata<TimeType>;
}


export const LOCALE_AU = {
    l1: 'red',
    l2: 'white',
    l3: 'blue'
}

export const LOCALE_EU = {
    l1: 'brown',
    l2: 'black',
    l3: 'grey'
}

export const LOCALE_US = {
    l1: 'black',
    l2: 'red',
    l3: 'blue'
}

export const LOCALE_CA = {
    l1: 'red',
    l2: 'black',
    l3: 'blue'
}