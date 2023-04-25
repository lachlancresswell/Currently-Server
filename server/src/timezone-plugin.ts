// Influx-plugin.ts
import { Plugin } from './plugin';
import { ConfigArray, ConfigVariableMetadata, EphemeralVariableMetaData, timezone } from '../../Types';
import { execSync } from 'child_process';

export interface TZOptions extends ConfigArray {
    date: EphemeralVariableMetaData<string>;
    timezone: EphemeralVariableMetaData<timezone>;
    ntpServers: EphemeralVariableMetaData<string[]>;
    dateFormat: ConfigVariableMetadata<string>;
    timeFormat: ConfigVariableMetadata<string>;
}

class TimeZonePlugin extends Plugin<TZOptions> {
    name = 'TimeZonePlugin';

    constructor(serverRouter: any, options: TZOptions) {
        super(serverRouter, options);

        this.setEphemeralVariable(this.configuration.date, this.getDate, this.setDate);
        this.setEphemeralVariable(this.configuration.timezone, this.getTimezone, this.setTimezone);
        this.setEphemeralVariable(this.configuration.ntpServers, this.getNtpServers, this.setNtpServers);
    }

    /**
     * Gets the current device timezone
     * @returns The current timezone
     */
    getTimezone = () => {
        return execSync(`timedatectl show --property=Timezone`).toString().split('=')[1].trim()
    }

    /**
     * Sets the device timezone
     * @param timezone The timezone to set in <country>/<city> format
     * @returns void
     * @throws Error if the timezone is invalid
     * @throws Error if the timezone is not found
     * @throws Error if the timezone is not configured
     * @example setTimezone('Australia/Melbourne')
     */
    setTimezone = (timezone: string): void => {
        try {
            execSync(`timedatectl set-timezone ${timezone}`);
            console.log(`Configured timezone to ${timezone}`);
        } catch (error) {
            console.error(`Error configuring timezone: ${(error as Error).message}`);
        }
    }

    /**
     * Sets the device date
     * @param date The date to set
     * @returns void
     * @throws Error if the date is invalid
     * @throws Error if the date is not configured
     * @example setDate(new Date())
    */
    setDate = (date: Date) => {
        const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

        try {
            execSync(`timedatectl set-ntp false && timedatectl set-time '${formattedDate}'`);
            console.log('Device date configured successfully!');
        } catch (error) {
            console.error(`Error configuring device date: ${error}`);
        }
    }

    /**
     * Gets the current device date
     * @returns The current device date
     * @throws Error if the date is not configured
     * @example getDate()
     */
    getDate(): string {
        const output = execSync('timedatectl').toString();
        const matches = /Local time: (.+)/.exec(output);
        if (!matches) {
            throw new Error('Unable to parse date from timedatectl output');
        }
        const dateString = matches[1];
        return dateString;
    }

    /**
     * Sets the NTP servers of the device
     * @param ntpServers The NTP servers to set
     * @returns void
     * @throws Error if the NTP servers are invalid
     * @example setNtpServers(['0.au.pool.ntp.org', '1.au.pool.ntp.org', '2.au.pool.ntp.org'])
     */
    setNtpServers(ntpServers: string[]): void {
        const primaryServer = ntpServers[0];
        const fallbackServers = ntpServers.slice(1);
        const command = `timedatectl set-ntp true && timedatectl set-ntp-server "${primaryServer}" ${fallbackServers.map(server => `"${server}"`).join(' ')}`;

        try {
            execSync(command);
            console.log(`NTP servers configured successfully! Primary server: ${primaryServer}. Fallback servers: ${fallbackServers.join(', ')}.`);
        } catch (error) {
            console.error(`Error configuring NTP servers: ${(error as Error).message}`);
        }
    }

    /**
     * Gets the NTP servers of the device
     * @returns The NTP servers of the device
     * @throws Error if the NTP servers are not configured
     * @example getNtpServers()
     */
    getNtpServers(): string[] {
        try {
            const currentServer = execSync('timedatectl show-timesync --property=ServerName').toString();
            const fallbackServers = execSync('timedatectl show-timesync --property=FallbackNTPServers').toString();

            const servers = [currentServer.trim().split('=')[1], ...fallbackServers.trim().split('=')[1].split(' ')]
            console.log('NTP servers retrieved successfully!');
            return servers;
        } catch (error) {
            console.error(`Error retrieving NTP servers: ${error} `);
            return [];
        }
    }
}

export default TimeZonePlugin;