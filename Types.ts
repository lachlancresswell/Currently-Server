export interface ConfigVariableMetadata<T> {
    priority: number;
    readableName: string;
    type: string;
    value: T;
    options?: string[];
    max?: number;
    min?: number;
}

export interface PluginConfiguration {
    [key: string | number]: ConfigVariableMetadata<any>
}

/**
 * Plugin configuration interface.
 */
export interface PluginConfig {
    path: string;
    enabled: boolean;
    config: PluginConfiguration;
}