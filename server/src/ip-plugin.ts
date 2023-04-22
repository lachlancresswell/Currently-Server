// Influx-plugin.ts
import { Plugin } from './plugin';
import { ConfigArray, ConfigVariableMetadata, EphemeralVariableMetaData, ipaddress, prefix } from '../../Types';
import { execSync } from 'child_process';
import dns from 'dns';
import { networkInterfaces } from 'os';
import fs from 'fs';

export interface IPOptions extends ConfigArray {
    filePath: ConfigVariableMetadata<string>;
    iface: ConfigVariableMetadata<string>;
    ipaddress: EphemeralVariableMetaData<ipaddress | undefined>;
    prefix: EphemeralVariableMetaData<prefix>;
    gateway: EphemeralVariableMetaData<ipaddress>;
    dns: EphemeralVariableMetaData<ipaddress[]>;
    dhcp: EphemeralVariableMetaData<boolean>;
}

export interface Address {
    [key: number | string]: boolean | string | number | string[] | undefined;
    internal: boolean;
    dhcp: boolean;
    ipaddress?: string;
    gateway?: string;
    prefix?: number;
    dns?: string[];
}

type NetFileSection = 'Address' | 'Gateway' | 'DNS' | 'DHCP';

class IPPlugin extends Plugin<IPOptions> {
    name = 'IPPlugin';

    constructor(serverRouter: any, options: IPOptions) {
        super(serverRouter, options);

        const _this = this;

        /**
         * Assigns a toJSON method to each ephemeral configuration parameter otherwise getters and setters will not be included in the JSON response.
         */
        this.configuration.ipaddress.toJSON = () => IPPlugin.jsonConverter(_this.configuration.ipaddress);
        this.configuration.dhcp.toJSON = () => IPPlugin.jsonConverter(_this.configuration.dhcp);
        this.configuration.gateway.toJSON = () => IPPlugin.jsonConverter(_this.configuration.gateway);
        this.configuration.prefix.toJSON = () => IPPlugin.jsonConverter(_this.configuration.prefix);
        this.configuration.dns.toJSON = () => IPPlugin.jsonConverter(_this.configuration.dns);

        /**
        * Sets the value of a network configuration parameter in a network file, creating the file if it does not exist. It also restarts the network service.
        * @param value - The value to set. Can be a string, number, boolean, an array of strings, or undefined.
        * @param key - The key of the configuration parameter to set.
        * @param netFileKey - The key of the section in the network file where the configuration parameter should be set. Can be Address, Gateway, DNS, or DHCP.
        * @param netFileValue - Optional. A string value other than val to set key to in the network file. If not provided, val will be used. Example: If updating IP address, val2 would be a string containing both the IP address and the prefix combined.
        * @returns void
        */
        function netSetter(value: string | number | boolean | string[] | undefined, key: string, netFileKey: NetFileSection, netFileValue?: string) {
            if (!netFileValue) netFileValue = value as string;
            if (fs.existsSync(_this.configuration.filePath.value!)) {
                IPPlugin.updateSystemdNetworkFile(netFileKey, `${netFileValue}`, _this.configuration.filePath.value!)
            } else {
                const config: Address = {
                    internal: false,
                    dhcp: _this.configuration.dhcp.value!,
                    ipaddress: _this.configuration.ipaddress.value,
                    prefix: _this.configuration.prefix.value,
                    gateway: _this.configuration.gateway.value,
                    dns: _this.configuration.dns.value,
                };

                config[key] = value;

                IPPlugin.createNetworkFile(config, _this.configuration.filePath.value!)
            }

            _this.restartNetworkD()
        }

        /**
         * Assign getters and setters to each ephemeral configuration parameter.
         */
        // IP Address
        Object.defineProperty(this.configuration.ipaddress, "value", {
            get(): ipaddress {
                const addresses = IPPlugin.getIpAddresses();
                const address = addresses.find((a) => a.nic === _this.configuration.iface.value);

                if (address) return address.ipaddress;
                else return '';
            },

            set(address: ipaddress) { netSetter(address, 'ipaddress', 'Address', `${address}/${_this.configuration.prefix.value}`) }
        });

        // Prefix
        Object.defineProperty(this.configuration.prefix, "value", {
            get(): prefix {
                const addresses = IPPlugin.getIpAddresses().find((a) => a.nic === _this.configuration.iface.value);

                if (addresses) return addresses.networkprefix as prefix;
                else return 32;
            },

            set(prefix: prefix) { netSetter(prefix, 'prefix', 'Address', `${_this.configuration.ipaddress.value}/${prefix}`) }
        });

        // Gateway
        Object.defineProperty(this.configuration.gateway, "value", {
            get(): ipaddress {
                return IPPlugin.getGatewayIP();
            },

            set(gateway: ipaddress) { netSetter(gateway, 'gateway', 'Gateway') }
        });

        // DNS
        Object.defineProperty(this.configuration.dns, "value", {
            get(): ipaddress[] {
                return dns.getServers();
            },

            set(dns: ipaddress[]) {
                if (!Array.isArray(dns)) {
                    dns = [dns];
                }
                netSetter(dns, 'dns', 'DNS', dns.join(' '));
            }
        });

        // DHCP
        Object.defineProperty(this.configuration.dhcp, "value", {
            get(): boolean {
                return IPPlugin.hasDynamicIpAddress(_this.configuration.iface.value!);
            },

            set(dhcp: boolean) { netSetter(dhcp, 'dhcp', 'DHCP', dhcp ? 'yes' : 'no') }
        });


    }

    /**
     * Creates a systemd network file with the provided IP address settings. Deletes any existing network file at the same file path.
     * @param ipSettings Object containing the IP address settings to set in the network file.
     * @param filePath The file path of the network file to create.
     */
    protected static createNetworkFile = (ipSettings: Address, filePath: string) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        const data = `[Match]
Name=${'enp0s2'}

[Network]
DHCP=${ipSettings.dhcp ? 'yes' : 'no'}
Address=${ipSettings.ipaddress}/${ipSettings.prefix}
Gateway=${ipSettings.gateway}
DNS=${ipSettings.dns?.join(' ')}`
        fs.writeFileSync(filePath, data);
    };

    /**
     * Updates the IP address set within an existing systemd network file.
     * If the file does not have an existing [Network] section or Address field,
     * this function inserts the new IP address under the [Network] section. If 
     * DHCP is enabled, IP address, gateway and DNS settings will not be added
     * @param ipAddress The new IP address to set in the network file.
     * @param filePath The file path of the network file to update.
     * @returns void
     */
    protected static updateSystemdNetworkFile = (field: NetFileSection, value: ipaddress, filePath: string) => {
        // Read the contents of the network file
        const networkFileContents = fs.readFileSync(filePath, 'utf8');

        // Split the network file contents into lines
        let lines = networkFileContents.split('\n');

        // Find the index of the [Network] section
        const networkSectionIndex = lines.findIndex(line => line.trim() === '[Network]');

        // If the [Network] section isn't present in the file, add it to the end of the file
        if (networkSectionIndex === -1) {
            lines.push('[Network]');
            lines.push(`${field}=${value}`);
        } else {
            // Find the index of the field to update within the [Network] section
            const fieldIndex = lines.findIndex(
                (line, index) =>
                    index > networkSectionIndex &&
                    line.trim().startsWith(field) &&
                    !line.trim().startsWith('#')
            );

            // If the field isn't present in the file, insert it into the [Network] section
            if (fieldIndex === -1) {
                const insertIndex = lines.findIndex(
                    (line, index) => index > networkSectionIndex && !line.trim().startsWith('#')
                );

                // Skip if DHCP is enabled
                if (!lines.find((line) => line.startsWith('DHCP=yes'))) {
                    lines.splice(insertIndex, 0, `${field}=${value}`);
                }
            } else {
                // Replace the old field value with the new field value
                lines[fieldIndex] = `${field}=${value}`;

                // If the field is 'DHCP' and 'value' is 'yes', remove all other address information from the [Netowork] section
                if (field === 'DHCP' && value === 'yes') {
                    const networkSectionIndex = lines.findIndex(line => line.trim() === '[Network]');
                    console.log(networkSectionIndex);
                    if (networkSectionIndex !== -1) {
                        lines = IPPlugin.trimNetworkFileToDhcp(lines);
                    }
                }
            }
        }

        // Write the updated network file contents back to the file
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    }

    /**
     * Removes IP address, gateway and DNS lines from a .network file and leaves DHCP configured
     * @param lines string array containing lines from a .network file
     * @returns string array containing original file contents with all fields
     * under [Network] removed except for the DHCP setting
     */
    static trimNetworkFileToDhcp = (lines: string[]) => {
        let inNetworkSection = false;
        const filteredArr: string[] = [];

        for (const item of lines) {
            if (item === "[Network]") {
                inNetworkSection = true;
            } else if (item.startsWith("[")) {
                inNetworkSection = false;
            }

            if (inNetworkSection && !item.includes("[Network]") && !item.includes("DHCP")) {
                continue;
            }

            filteredArr.push(item);
        }

        return filteredArr;
    }


    /**
     * Restarts the systemd-networkd service.
     */
    protected restartNetworkD = () => {
        const cmd = 'sudo systemctl restart systemd-networkd.service'
        execSync(cmd);
    }

    /**
     * Retrieves the local IP addresses for all non-internal IPv4 network interfaces.
     * @returns {string[]} An array of local IP addresses as strings.
     */
    static getIpAddresses() {
        const NICs = networkInterfaces();
        const addresses: {
            nic: string,
            ipaddress: ipaddress,
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

    /**
     * Checks if the specified network interface has a dynamic IP address.
     * @param interfaceName interface to check
     * @returns true if interface has dynamic IP, false otherwise
     */
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

    /**
     * Retrieves the default gateway IP address.
     * @returns {string} The default gateway IP address.
    */
    static getGatewayIP = () => {
        const stdout = execSync('ip route').toString()
        const defaultRouteMatch = stdout.match(/^default\s+via\s+(\S+)\s+/m);

        return defaultRouteMatch![1]
    };

    /**
     * Removes getter from object
     * @param obj object to remove getter from
     */
    static jsonConverter = <T>(obj: T) => {
        const properties = Object.getOwnPropertyNames(obj);
        const jsonObject: any = {};

        for (const property of properties) {
            jsonObject[property] = (obj as any)[property];
        }

        return jsonObject as T;
    }
}

export default IPPlugin;