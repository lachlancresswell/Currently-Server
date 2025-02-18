// Influx-plugin.ts
import { Plugin } from './plugin';
import { ConfigArray, ConfigValue, ConfigVariableMetadata, EphemeralVariableMetaData, IPOptions, ipaddress, prefix } from '../../Types';
import { execSync } from 'child_process';
import dns from 'dns';
import { networkInterfaces } from 'os';
import fs from 'fs';
import axios from 'axios'

export interface Address {
    [key: number | string]: boolean | string | number | string[] | undefined;
    internal: boolean;
    dhcp: boolean;
    ipaddress?: string;
    gateway?: string;
    prefix?: number;
    dns?: string[];
}

type NetFileSection = 'Address' | 'Gateway' | 'DNS' | 'DHCP' | 'Name';

class IPPlugin extends Plugin<IPOptions> {
    name = 'IPPlugin';

    constructor(serverRouter: any, options: IPOptions) {
        super(serverRouter, options);

        const _this = this;

        this.scheduleTask(async () => {
            const rtn = await IPPlugin.checkInternet();
            this.configuration.internetStatus.value = rtn;
        }, this.configuration.internetPollMs.value || 1000); // poll every 5 seconds

        /**
         * Assign getters and setters to each ephemeral configuration parameter.
         */
        // IP Address
        this.setEphemeralVariable(this.configuration.ipaddress, () => {
            const addresses = IPPlugin.getIpAddresses();
            const address = addresses.find((a) => a.nic === _this.configuration.iface.value);

            if (address) return address.ipaddress;
            else return '';
        },
            (address: ipaddress) => this.netSetter(address, 'ipaddress', 'Address', `${address}/${_this.configuration.prefix.value}`)
        )

        // Prefix
        this.setEphemeralVariable(this.configuration.prefix, () => {
            const addresses = IPPlugin.getIpAddresses().find((a) => a.nic === _this.configuration.iface.value);

            if (addresses) return addresses.networkprefix as prefix;
            else return 32;
        },
            (prefix: prefix) => this.netSetter(prefix, 'prefix', 'Address', `${_this.configuration.ipaddress.value}/${prefix}`)
        );

        // Gateway
        this.setEphemeralVariable(this.configuration.gateway, () => IPPlugin.getGatewayIP(this.configuration.iface.value),
            (gateway: ipaddress) => this.netSetter(gateway, 'gateway', 'Gateway')
        );

        // DNS
        this.setEphemeralVariable(this.configuration.dns, dns.getServers,
            (dns: ipaddress[]) => {
                if (!Array.isArray(dns)) {
                    dns = [dns];
                }
                return this.netSetter(dns, 'dns', 'DNS', dns.join(' '));
            }
        );

        // DHCP
        this.setEphemeralVariable(this.configuration.dhcp, () => this.netGetter('DHCP', this.configuration.iface.value!),

            (dhcp: boolean) => {
                this.netSetter(this.configuration.iface.value, 'iface', 'Name', this.configuration.iface.value);
                this.netSetter(dhcp, 'dhcp', 'DHCP', dhcp ? 'yes' : 'no')
            }
        );


    }

    /**
        * Sets the value of a network configuration parameter in a network file, creating the file if it does not exist. It also restarts the network service.
        * @param value - The value to set. Can be a string, number, boolean, an array of strings, or undefined.
        * @param key - The key of the configuration parameter to set.
        * @param netFileKey - The key of the section in the network file where the configuration parameter should be set. Can be Address, Gateway, DNS, or DHCP.
        * @param netFileValue - Optional. A string value other than val to set key to in the network file. If not provided, val will be used. Example: If updating IP address, val2 would be a string containing both the IP address and the prefix combined.
        * @returns void
        */
    netSetter = (value: string | number | boolean | string[] | undefined, key: string, netFileKey: NetFileSection, netFileValue?: string) => {
        if (!netFileValue) netFileValue = value as string;
        if (fs.existsSync(this.configuration.filePath.value!)) {
            IPPlugin.updateSystemdNetworkFile(netFileKey, `${netFileValue}`, this.configuration.filePath.value!)
        } else {
            const config: Address = {
                internal: false,
                dhcp: this.configuration.dhcp.value!,
                ipaddress: this.configuration.ipaddress.value,
                prefix: this.configuration.prefix.value,
                gateway: this.configuration.gateway.value,
                dns: this.configuration.dns.value,
            };

            config[key] = value;

            IPPlugin.createNetworkFile(config, this.configuration.filePath.value!, this.configuration.iface.value!)
        }

        this.restartNetworkD()
    }

    netGetter = (netFileKey: NetFileSection, iface: string) => IPPlugin.readSystemdNetworkFile(netFileKey, this.configuration.filePath.value!, iface);

    // Ensure DHCP is configured first
    sort = (keys: string[]) => keys.sort();

    /**
     * Creates a systemd network file with the provided IP address settings. Deletes any existing network file at the same file path.
     * @param ipSettings Object containing the IP address settings to set in the network file.
     * @param filePath The file path of the network file to create.
     */
    protected static createNetworkFile = (ipSettings: Address, filePath: string, iface: string) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        const data = `[Match]
Name=${iface}

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

        // Find the index of the [Match] section
        const matchSectionIndex = lines.findIndex(line => line.trim() === '[Match]');


        // Find the index of the [Network] section
        const networkSectionIndex = lines.findIndex(line => line.trim() === '[Network]');

        // Handle interface name
        if (field === 'Name') {
            const fieldIndex = lines.findIndex(
                (line, index) =>
                    index > matchSectionIndex &&
                    line.trim().startsWith(field) &&
                    !line.trim().startsWith('#')
            );

            lines[fieldIndex] = `${field}=${value}`;
        } else if (networkSectionIndex === -1) { // If the [Network] section isn't present in the file, add it to the end of the file

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

    protected static readSystemdNetworkFile = (field: NetFileSection, filePath: string, iface?: string) => {
        // Read the contents of the network file
        const networkFileContents = fs.readFileSync(filePath, 'utf8');

        // Split the network file contents into lines
        let lines = networkFileContents.split('\n');

        // Find the index of the [Match] section
        const matchSectionIndex = lines.findIndex(line => line.trim() === '[Match]');

        if (matchSectionIndex < 0) {
            return undefined;
        }

        // Find the index of the [Network] section
        const networkSectionIndex = lines.findIndex(line => line.trim() === '[Network]');

        const interfaceIndex = iface ? lines.findIndex(
            (line, index) =>
                index > matchSectionIndex &&
                index > networkSectionIndex &&
                line.trim().includes(iface) &&
                !line.trim().startsWith('#')
        ) : -1;

        if ((interfaceIndex < 0 && iface)
            || networkSectionIndex
        ) {
            return undefined;
        }

        const fieldIndex = lines.findIndex(
            (line, index) =>
                index > networkSectionIndex &&
                line.trim().startsWith(field) &&
                !line.trim().startsWith('#')
        );

        // If the field isn't present in the file, insert it into the [Network] section
        if (fieldIndex === -1) {
            return undefined;
        }

        if (lines[fieldIndex].split("=")[1].toLowerCase() === 'yes') {
            return true;
        }
        if (lines[fieldIndex].split("=")[1].toLowerCase() === 'no') {
            return false;
        }

        return lines[fieldIndex].split("=")[1]
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
        const cmd = 'systemctl restart systemd-networkd.service'
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
            const commandOutput = execSync(`ip a show ${interfaceName} | grep 'inet ' || true`).toString()

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
     * @returns {string | undefined} The default gateway IP address.
    */
    static getGatewayIP = (nic?: string): string | undefined => {
        let cmd = 'ip route';
        if (nic) {
            cmd += ' show dev ' + nic;
        }

        try {
            const stdout = execSync(cmd).toString()
            const defaultRouteMatch = stdout.match(/^default\s+via\s+(\S+)\s+/m);

            if (defaultRouteMatch && defaultRouteMatch.length > 1) {
                return defaultRouteMatch[1]
            } else {
                return undefined;
            }
        } catch (e) {
            console.error((e as Error).message)
            return undefined;
        }
    };


    /**
     * Checks if internet is available by making a request to google.com
     * @returns {boolean} true if internet is available, false otherwise
     */
    static async checkInternet(): Promise<boolean> {
        try {
            const response = await axios.get('http://www.google.com');
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
}

export default IPPlugin;