import { ChildProcess, execSync } from 'child_process';
import TimeZonePlugin from '../../timezone-plugin';
import { TZOptions } from '../../../../Types';

const config: TZOptions = {
    date: {
        priority: 0,
        readableName: 'Date',
        type: 'string',
        display: true,
        key: 'date'
    },
    timezone: {
        priority: 0,
        readableName: 'Timezone',
        type: 'string',
        display: true,
        key: 'timezone'
    },
    ntpServers: {
        priority: 0,
        readableName: 'NTP Servers',
        type: 'strings',
        display: true,
        key: 'ntpServers'
    },
    dateFormat: {
        priority: 0,
        readableName: 'Date Format',
        type: 'string',
        display: true,
        key: 'dateFormat'
    },
    timeFormat: {
        priority: 0,
        readableName: 'Time Format',
        type: 'string',
        display: true,
        key: 'timeFormat'
    },
    time: {
        priority: 0,
        readableName: 'Time',
        type: 'string',
        display: true,
        key: 'time'
    },
    timezoneCountry: {
        priority: 0,
        readableName: 'Timezone Country',
        type: 'string',
        display: true,
        key: 'timezoneCountry'
    },
}

/**
 * Mocks the child_process module to return a time configurations of our choosing.
 */
jest.mock("child_process", () => {
    return {
        execSync: jest.fn((cmd: string) => {
            if (cmd.includes('timedatectl show --property=Timezone')) {
                return 'Timezone=Australia/Melbourne'
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

    describe('getTimezone', () => {
        it('should return the timezone in Country/City format', () => {
            const plugin = new TimeZonePlugin(null, config);
            const timezone = plugin.getTimezone();
            expect(timezone).toContain('Australia/Melbourne');
        });
    });

    describe('setTimezone', () => {
        it('should set the timezone using Country/City format', () => {
            const plugin = new TimeZonePlugin(null, config);
            plugin.setTimezone('Australia/Melbourne');
            expect(execSync).toHaveBeenCalled();
        });
    });

    describe('getDate', () => {
        test('getDate returns date in dmy format', () => {
            const plugin = new TimeZonePlugin(null, config);
            const date = plugin.getDate('dmy');
            expect(date).toEqual(expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}$/));
        });

        test('getDate returns date in mdy format', () => {
            const plugin = new TimeZonePlugin(null, config);
            const date = plugin.getDate('mdy');
            expect(date).toEqual(expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}$/));
        });
    });

    describe('getDate', () => {
        it(('should get the date in mdy format'), () => {
            const plugin = new TimeZonePlugin(null, config);
            const date = plugin.getDate();
            expect(date).toContain('/2023');
        });

    })
    describe('shouuld set the date', () => {
        it(('should setDate'), () => {
            const plugin = new TimeZonePlugin(null, config);
            const date = new Date();
            plugin.setDate(date);
            expect(execSync).toHaveBeenCalled();
        });
    })

    describe('should get the url of the current NTP server', () => {
        it(('should getNtpServer'), () => {
            const plugin = new TimeZonePlugin(null, config);
            const server = plugin.getNtpServers();
            expect(server[0]).toContain('pool.ntp.org');
        });

    })
    describe('should set the NTP server url', () => {
        it(('should setNtpServer'), () => {
            const plugin = new TimeZonePlugin(null, config);
            const server = ['myserver'];
            plugin.setNtpServers(server);
            expect(execSync).toHaveBeenCalled();
        });
    })

    describe(('getTime'), () => {
        it(('should return 24h format'), () => {
            const plugin = new TimeZonePlugin(null, config);
            const time = plugin.getTime('24h');
            expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });

        it(('should return 12h format'), () => {
            const plugin = new TimeZonePlugin(null, config);
            const time = plugin.getTime('12h');
            expect(time).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
        });
    });
});