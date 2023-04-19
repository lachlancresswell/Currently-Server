// Influx-plugin.ts
import { Plugin, Route } from './plugin';
import { ConfigArray, ConfigVariableMetadata } from '../../Types';
import { exec, execSync } from 'child_process';
import dns from 'dns';
import { networkInterfaces } from 'os';
import fs from 'fs';

export interface IPOptions extends ConfigArray {
    ipAddress: ConfigVariableMetadata<'ipaddress'>;
    subnetMask: ConfigVariableMetadata<'subnetmask'>;
    gateway: ConfigVariableMetadata<'ipaddress'>;
    dnsServer1: ConfigVariableMetadata<'ipaddress'>;
    dnsServer2: ConfigVariableMetadata<'ipaddress'>;
    dhcp: ConfigVariableMetadata<boolean>;
    filePath: ConfigVariableMetadata<string>;
    iface: ConfigVariableMetadata<string>;
}

export interface Address {
    internal: boolean;
    dhcp: boolean;
    ipaddress?: string;
    gateway?: string;
    networkprefix?: number;
    dns?: string[];
}

class IPPlugin extends Plugin<IPOptions> {
    name = 'IPPlugin';

    constructor(serverRouter: any, options: any) {
        super(serverRouter, options);
    }

    load = () => {
        this.registerRoutes();
    }

    registerRoutes = () => {
        const routes: Route[] = [
            { path: '/ip', type: 'POST', handler: this.ipHandler },
            { path: '/get-ip', type: 'GET', handler: this.getIpHandler },
        ];

        routes.forEach((route) => this.registerRoute(route.path, route.type, route.handler as any));
    };

    protected ipHandler = async (req: any, res: any) => {
        const ipSettings: Address = req.body;

        try {
            IPPlugin.createNetworkFile(ipSettings, this.configuration.filePath.value)
            await this.restartNetworkD()
            res.status(200).send('Network settings updated and system restarted.');
        } catch (e) {
            res.status(500).send(e);
        }
    };

    protected static createNetworkFile = (ipSettings: Address, filePath: string) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        const data = `
        [Match]
        Type=ether
        
        [Network]
        DHCP=${ipSettings.dhcp ? 'yes' : 'no'}
        Address=${ipSettings.ipaddress}/${ipSettings.networkprefix}
        Gateway=${ipSettings.gateway}
        DNS=${ipSettings.dns?.join()}
        `
        return fs.writeFileSync(filePath, data);
    };

    protected restartNetworkD = () => new Promise((resolve, reject) => {
        const cmd = 'sudo systemctl restart systemd-networkd.service'


        exec(cmd, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`exec error: ${error} `);
                return reject(error);
            }

            console.log(`stdout: ${stdout} `);
            console.error(`stderr: ${stderr} `);

            resolve('Network service restarted.');
        });
    })

    protected getIpHandler = async (req: any, res: any) => {
        try {
            const ipAddresses = IPPlugin.getIpAddresses();
            const gateway = await IPPlugin.getGatewayIP();
            const dnsServers = dns.getServers();

            const NIC = ipAddresses.find((a) => a.nic === this.configuration.iface.value)!
            const output: Address = {
                ...NIC,
                dns: dnsServers,
                gateway
            }
            res.status(200).send(output);
        } catch (e) {
            res.status(500).send(e);
        }

    };

    /**
     * Retrieves the local IP addresses for all non-internal IPv4 network interfaces.
     * @returns {string[]} An array of local IP addresses as strings.
     */
    static getIpAddresses() {
        const NICs = networkInterfaces();
        const addresses: {
            nic: string,
            ipaddress: string,
            internal: boolean,
            networkprefix: number,
            dhcp: boolean
        }[] = [];

        for (const interfaceName in NICs) {
            const networkInterface = NICs[interfaceName];
            if (networkInterface) {
                for (const iface of networkInterface) {
                    if (iface.family === 'IPv4') {
                        addresses.push({
                            nic: interfaceName,
                            ipaddress: iface.address,
                            internal: iface.internal,
                            networkprefix: parseInt(iface.cidr!.split('/')[1]),
                            dhcp: IPPlugin.hasDynamicIpAddress(interfaceName)
                        });
                    }
                }
            }
        }


        return addresses;
    }

    static hasDynamicIpAddress = (interfaceName: string): boolean => {
        try {
            // Execute the command to get the IP addresses for the specified network interface
            const commandOutput = execSync(`ip a show ${interfaceName} `).toString()

            // Check if the output contains the string "dynamic"
            return commandOutput.includes("dynamic");
        } catch (error) {
            // If there is an error, log it and return false
            console.error(error);
            return false;
        }
    }

    static getGatewayIP = (): Promise<string> =>
        new Promise((resolve, reject) => {
            exec('ip route | grep default | awk \'{print $3}\'', (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else if (stderr) {
                    reject(stderr);
                } else {
                    const gatewayIP = stdout.trim();
                    resolve(gatewayIP);
                }
            });
        });
}

export default IPPlugin;