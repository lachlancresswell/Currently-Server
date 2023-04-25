import { execSync } from 'child_process';
import TimeZonePlugin, { TZOptions } from '../../timezone-plugin';

const config: TZOptions = {
    date: {
        priority: 0,
        readableName: 'Date',
        type: 'string',
        display: true,
    },
    timezone: {
        priority: 0,
        readableName: 'Timezone',
        type: 'string',
        display: true,
    },
    ntpServers: {
        priority: 0,
        readableName: 'NTP Servers',
        type: 'strings',
        display: true,
    },
    dateFormat: {
        priority: 0,
        readableName: 'Date Format',
        type: 'string',
        display: true,
    },
    timeFormat: {
        priority: 0,
        readableName: 'Time Format',
        type: 'string',
        display: true,
    }

}

/**
 * Mocks the child_process module to return a time configurations of our choosing.
 */
jest.mock("child_process", () => {
    return {
        execSync: jest.fn((cmd: string) => {
            if (cmd.includes('timedatectl show --property=Timezone')) {
                return 'Australia/Melbourne'
            } else if (cmd === `timedatectl`) {
                return `               Local time: Sat 2023-04-22 15:12:32 AEST
                Universal time: Sat 2023-04-22 05:12:32 UTC
                      RTC time: Sat 2023-04-22 05:12:33
                     Time zone: Australia/Melbourne (AEST, +1000)
     System clock synchronized: yes
                   NTP service: active
               RTC in local TZ: no`
            } else if (cmd.includes(`timedatectl show-timesync --property=ServerName`)) {
                return `ServerName=2.debian.pool.ntp.org`;
            } else if (cmd.includes(`timedatectl show-timesync --property=FallbackNTPServers`)) {
                return `FallbackNTPServers=0.debian.pool.ntp.org 1.debian.pool.ntp.org 2.debian.pool.ntp.org 3.debian.pool.ntp.org`;
            } else {
                return ''
            }
        }),
    }
});

describe(('TimeZonePlugin'), () => {

    test('getTimezone', () => {
        const plugin = new TimeZonePlugin(null, config);
        const timezone = plugin.getTimezone();
        expect(timezone).toContain('Australia/Melbourne');
    });

    test('setTimezone', () => {
        const plugin = new TimeZonePlugin(null, config);
        plugin.setTimezone('Australia/Melbourne');
        expect(execSync).toHaveBeenCalled();
    });

    test(('getDate'), () => {
        const plugin = new TimeZonePlugin(null, config);
        const date = plugin.getDate();
        expect(date).toContain('2023-');
    });

    test(('setDate'), () => {
        const plugin = new TimeZonePlugin(null, config);
        const date = new Date();
        plugin.setDate(date);
        expect(execSync).toHaveBeenCalled();
    });

    test(('getNtpServer'), () => {
        const plugin = new TimeZonePlugin(null, config);
        const server = plugin.getNtpServers();
        expect(server[0]).toContain('pool.ntp.org');
    });

    test(('setNtpServer'), () => {
        const plugin = new TimeZonePlugin(null, config);
        const server = ['myserver'];
        plugin.setNtpServers(server);
        expect(execSync).toHaveBeenCalled();
    });
});