import { Plugin } from '../plugin';
import { EventEmitter } from 'events';

export default class MockPlugin extends EventEmitter {
    public name = 'MOCK PLUGIN';
    public configuration: {
        [key: string | number]: any
    };

    constructor() {
        super();
        this.configuration = {};

        console.log('Mock Plugin Constructor');
    }

    load = jest.fn(() => {
        console.log('Mock Plugin Load');
    });
    unload = jest.fn(() => {
        console.log('Mock Plugin Unloaded');
    });

    updateConfigVariable = (key: string, value: any) => {
        this.configuration[key] = value;
        console.log(`Set ${key} to ${value}`);
    }
}
