import * as Plugin from './plugin';
import * as Server from './server'
import * as SetIp from 'set-ip-address'
import { networkInterfaces, NetworkInterfaceInfo } from 'os';

interface Options extends Plugin.Options {
    interface: Plugin.ClientOption<string>,
    dhcp?: Plugin.ClientOption<boolean>,
    ip?: Plugin.ClientOption<string>,
    mask?: Plugin.ClientOption<string>,
    gateway?: Plugin.ClientOption<string>,
    dns1?: Plugin.ClientOption<string>,
    dns2?: Plugin.ClientOption<string>,
}

export const defaultOptions: Options = {
    interface: {
        priority: 0,
        readableName: 'Interface',
        restart: 'restart-server',
        value: 'enp0s5'
    },
    ip: {
        priority: 0,
        readableName: 'IP Address',
        restart: 'restart-server',
        value: '192.168.1.10'
    },
    mask: {
        priority: 0,
        readableName: 'Mask',
        restart: 'restart-server',
        value: '255.255.255.0'
    },
    gateway: {
        priority: 0,
        readableName: 'Gateway',
        restart: 'restart-server',
        value: '192.168.1.254'
    },
    dhcp: {
        priority: 0,
        readableName: 'DHCP',
        restart: 'restart-server',
        value: true,
    }
}

export class plugin extends Plugin.Instance {
    options!: Options;
    nets: NodeJS.Dict<NetworkInterfaceInfo[]>;
    ips?: { [index: string]: NetworkInterfaceInfo[] };

    constructor(app: Server.default, options?: Options, name?: string) {
        super(app, options, name, defaultOptions);

        this.nets = networkInterfaces();
    }

    load = () => {
        super.load();
        this.getIps();
    }

    setIp = (ip: string): Promise<void> => {
        const iface = {
            dhcp: false,
            interface: this.options.interface.value,
            prefix: 24,
            ip_address: ip,
        }

        return SetIp.configure([iface]).then(SetIp.restartService);
    }

    getIps() {
        const results = Object.create(null); // Or just '{}', an empty object
        for (const name of Object.keys(this.nets)) {
            for (const net of this.nets[name]!) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
                const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
                if (net.family === familyV4Value && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net);
                }
            }
        }
        this.ips = results;

        this.options.ip!.value = this.ips![this.options.interface.value][0].address;
        this.options.mask!.value = this.ips![this.options.interface.value][0].netmask;
    }

    restartInterface = () => SetIp.restartService().then(() => console.log('network service restarted'))
}


