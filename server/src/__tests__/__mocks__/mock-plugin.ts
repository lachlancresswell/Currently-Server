import { EventEmitter } from 'events';
import { PluginConfig } from '../../../../Types';
import { Routing } from '../../server';

export default class MockPlugin extends EventEmitter {
    public name = 'MOCK PLUGIN';
    public configuration: PluginConfig;

    constructor(serverRouter?: Routing, options?: PluginConfig) {
        super();
        this.configuration = {} as any;
        if (options) this.configuration = options;

        console.log('Mock Plugin Constructor');
    }

    load = jest.fn(() => {
        console.log('Mock Plugin Load');
    });
    unload = jest.fn(() => {
        console.log('Mock Plugin Unloaded');
    });

    updateConfigVariable = (key: string, value: any) => {
        // this.configuration[key] = value;
        // console.log(`Set ${key} to ${value}`);
    }
}
