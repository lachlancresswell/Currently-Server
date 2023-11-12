import { EventEmitter } from 'events';
import { ConfigVariableMetadata, PluginConfig, PluginJSON } from '../../../../Types';
import { Routing } from '../../server';

export const MOCK_PLUGIN_NAME = 'MOCK PLUGIN';
export default class MockPlugin extends EventEmitter {
    public name = MOCK_PLUGIN_NAME;
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

const metadataMaxMin: ConfigVariableMetadata<number> = {
    priority: 1,
    readableName: 'Test Variable with max min allowed numbers',
    type: 'number',
    value: 5,
    max: 10,
    min: 1,
    key: 'testVar',
};

const metadataStringOptions: ConfigVariableMetadata<string> = {
    priority: 1,
    readableName: 'Test Variable with string options',
    type: 'string',
    value: 'option3',
    options: ['option1', 'option2', 'option3', 'option5'],
    key: 'testVar',
};

export const mockPluginConfig: PluginJSON = {
    plugin1: {
        path: 'string',
        enabled: true,
        config: {
            "testVar1": {
                priority: 1,
                value: 1,
                type: 'number',
                readableName: 'Test Var 1',
                key: 'testVar1',
                restart: 'server',
            },
            "testVar2": {
                priority: 1,
                value: 2,
                type: 'number',
                readableName: 'Test Var 2',
                key: 'testVar2',
            },
            "testVar3": {
                priority: 1,
                value: 3,
                type: 'number',
                readableName: 'Test Var 3',
                key: 'testVar3',
            },
            metadataMaxMin,
            metadataStringOptions
        }
    },
    plugin2: {
        path: 'string',
        enabled: true,
        config: {
            "testVar1": {
                priority: 1,
                value: 1,
                type: 'number',
                readableName: 'Test Var 1',
                key: 'testVar1',
            },
            "testVar2": {
                priority: 1,
                value: 2,
                type: 'number',
                readableName: 'Test Var 2',
                key: 'testVar2',
            },
            "testVar3": {
                priority: 1,
                value: 3,
                type: 'number',
                readableName: 'Test Var 3',
                key: 'testVar3',
            },
        }
    }
};