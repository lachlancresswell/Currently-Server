// Influx-plugin.ts
import { Plugin } from './plugin';
import { DateType, TZOptions, TimeType } from '../../Types';
import { execSync } from 'child_process';

class TimeZonePlugin extends Plugin<TZOptions> {
    name = 'TimeZonePlugin';

    constructor(serverRouter: any, options: TZOptions) {
        super(serverRouter, options);

        this.setEphemeralVariable(this.configuration.date, () => this.getDate(this.configuration.dateFormat.value), this.setDate);
        this.setEphemeralVariable(this.configuration.time, () => this.getTime(this.configuration.timeFormat.value), this.setTime);
        this.setEphemeralVariable(this.configuration.timezone, this.getTimezone, this.setTimezone);
        this.setEphemeralVariable(this.configuration.ntpServers, this.getNtpServers, this.setNtpServers);
    }

    /**
     * Gets the current device timezone in GMT format
     * @returns The current timezone in Country/City format
     */
    getTimezone = () => {
        return execSync(`timedatectl show --property=Timezone`).toString().split('=')[1].trim()
    }

    /**
     * Sets the device timezone
     * @param timezone The timezone to set in 'Region/City' format
     * @returns void
     * @throws Error if the timezone is invalid
     * @throws Error if the timezone is not configured
     * @example setTimezone('Australia/Melbourne')
     */
    setTimezone = (timezone: string): void => {
        try {
            // Throws if the timezone is invalid
            execSync(`timedatectl list-timezones | grep ${timezone}`);
            execSync(`sudo timedatectl set-timezone ${timezone}`);
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
 * @param {string} format - The desired format for the date ('DMY' or 'MDY')
 * @returns The current device date in the specified format
 * @throws Error if the date is not configured
 * @example getDate('DMY')
 */
    getDate(format: DateType = 'dmy'): string {
        const output = execSync('timedatectl').toString();
        const matches = /Local time: \S+ (\S+)/.exec(output);

        if (!matches) {
            throw new Error('Unable to parse date from timedatectl output');
        }

        // Parse the date string into a JavaScript Date object
        const dateParts = matches[1].split('-');
        const dateObj = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]);

        // Format the date according to the specified format
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1; // JavaScript months are 0-11
        const year = dateObj.getFullYear();

        let rtn = ''
        if (format === 'dmy') {
            rtn = `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;
        } else if (format === 'mdy') {
            rtn = `${month < 10 ? '0' : ''}${month}/${day < 10 ? '0' : ''}${day}/${year}`;
        } else {
            throw new Error(`Invalid format: ${format}`);
        }

        return rtn;
    }

    /**
     * Gets the current device time
     * @param {TimeType} timeFormat - The desired format for the time ('24h' or '12h')
     * @returns The current device time in the specified format
     * @throws Error if the time is not configured
     * @example getTime('12h')
     */
    getTime(timeFormat: TimeType = '24h'): string {
        const output = execSync('timedatectl').toString();
        const matches = /Local time: \S+ \S+ (\S+)/.exec(output);

        if (!matches) {
            throw new Error('Unable to parse time from timedatectl output');
        }

        // Parse the time string into a JavaScript Date object
        const timeParts = matches[1].split(':');
        const dateObj = new Date();
        dateObj.setHours(+timeParts[0]);
        dateObj.setMinutes(+timeParts[1]);
        dateObj.setSeconds(+timeParts[2]);

        // Format the time according to the specified format
        let hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        const seconds = dateObj.getSeconds();

        let rtn = '';
        if (timeFormat === '12h') {
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12' in 12h format
            rtn = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds} ${period}`;
        } else if (timeFormat === '24h') {
            rtn = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            throw new Error(`Invalid time format: ${timeFormat}`);
        }

        return rtn;
    }



    // TODO
    setTime(): void {

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
            return servers;
        } catch (error) {
            console.error(`Error retrieving NTP servers: ${error} `);
            return [];
        }
    }
}

export default TimeZonePlugin;