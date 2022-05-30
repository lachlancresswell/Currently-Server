import * as Plugin from './plugin';
import * as Server from './server'
import * as SetIp from 'set-ip-address'
import { networkInterfaces, NetworkInterfaceInfo } from 'os';

interface Options extends Plugin.Options {
    dhcp?: Plugin.ClientOption<boolean>,
    ip?: Plugin.ClientOption<string>,
    mask?: Plugin.ClientOption<string>,
    gateway?: Plugin.ClientOption<string>,
    dns1?: Plugin.ClientOption<string>,
    dns2?: Plugin.ClientOption<string>,
}

const defaultOptions: Options = {
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

    setIp = () => {
        const eth0 = {
            dhcp: this.options.dhcp,
            interface: 'eth0',
            ip_address: this.options.ip,
            prefix: 20,
            gateway: this.options.gateway,
            nameservers: [this.options.dns1, this.options.dns2],
            optional: true // (netplan) - dont wait for interfaces to avoid boot delay
        }

        SetIp.configure([eth0]).then(() => console.log('done writing config files'));
    }

    getIps = () => {
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

        this.options.ip!.value = this.ips!.en5[0].address;
        this.options.mask!.value = this.ips!.en5[0].netmask;
    }

    restartInterface = () => SetIp.restartService().then(() => console.log('network service restarted'))
}


