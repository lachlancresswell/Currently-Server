import * as Plugin from './plugin';
import * as Server from './server'
import * as ChildProcess from 'child_process';
import * as Util from 'util';


interface Options extends Plugin.Options {
}

export const defaultOptions: Options = {

}

interface TimeDateCtl {
    'Local time': string,
    'NTP service': string,
    'RTC in local TZ': string,
    'RTC time': string,
    'System clock synchronized': string,
    'Time zone': string,
    'Universal time': string,
};

export class plugin extends Plugin.Instance {
    options!: Options;

    constructor(app: Server.default, options?: Options, name?: string) {
        super(app, options, name, defaultOptions);

        // const _this = this;
        // this.app.registerPostRoute(`/set_date`, (req, res) => {
        //     const date = req.body.date;
        //     return this.setDate(date).then(() => res.send(true), (e) => res.send(JSON.stringify(e)));
        // })

        this.app.registerPostRoute(`/util/timedatectl/:key`, (req, res) => {
            switch (req.params.key) {
                case 'ntp':
                    const val = req.body as boolean;
                    res.send(JSON.stringify(this.timedatectl()))
                    break;
            }
        })

        this.app.registerGetRoute(`/util/:key`, (_req, res) => {
            switch (_req.params.key) {
                case 'timedatectl':
                    res.send(JSON.stringify(this.timedatectl()))
                    break;
            }
        })

        // let s = "";
        // console.stdout?.on("data", (str) => {
        //     s += str;
        //     if (s.length === 69) {
        //         console.kill();
        //         res(s.slice(59, -2));
        //     }
        // });

        // await(0, shared_1.exec)(`${sudo} timedatectl set-ntp false`);
        // await(0, shared_1.exec)(`${sudo} date -s "${dateFormat(dateTime, "UTC:mm/dd/yyyy HH:MM:ss")}" --utc`);
        // await(0, shared_1.exec)(`${sudo} hwclock -w --utc`);

    }

    parseCmdOutput = (output: string) => {
        const rtn = output.split('\n').map((e: any) => e.trim()).filter(Boolean)
        const obj: { [key: string]: string } = {};
        rtn.forEach((e: any) => {
            const wow = e.split(': ');
            const key = wow[0];
            const value = wow[1];
            obj[key] = value
        })

        return obj;
    }

    timedatectl = () => {
        let rtn = ChildProcess.execSync('timedatectl').toString();
        const obj = this.parseCmdOutput(rtn) as any as TimeDateCtl;

        return obj;
    }

    // setDate = (date: Date) => DateTimeControl.setDateTime(date);
}
