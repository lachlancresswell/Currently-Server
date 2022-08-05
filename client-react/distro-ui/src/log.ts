export interface Message {
    date: Date,
    level: string,
    text: string,
    service: string,
};

export interface History {
    [id: string]: Message[],
    DEBUG: Message[],
    INFO: Message[],
    WARN: Message[],
    ERROR: Message[]
}

type Level = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';


export class Logger {
    name: string;
    history: History;
    cb: () => any;

    constructor(name: string, cb = () => { }) {
        this.name = name;
        this.history = {
            DEBUG: [],
            INFO: [],
            WARN: [],
            ERROR: [],
        }
        this.cb = cb;
    }

    attachListener(level: Level, cb: any) {
        switch (level) {
            case 'DEBUG':
                this.debugCB = cb;
                break;
            case 'INFO':
                this.infoCB = cb;
                break;
            case 'WARN':
                this.warnCB = cb;
                break;
            case 'ERROR':
                this.errorCB = cb;
                break;
        }
    }

    getUnique(level: Level) {
        const a = this.history[level].reverse();
        const unique: Message[] = [];
        a.forEach((val, i, array) => {
            const len = unique.length;
            if (i > 0) {
                if (unique[len].text !== val.text) {
                    unique.push(val)
                }
            } else {
                unique.push(val)
            }
        })

        return unique;
    }

    log(level: Level, ...elements: any[]) {
        let s = ' '
        if (elements.length && typeof elements[0] === 'string') {
            // special case for the first arg, which is probably a string
            s += elements.shift()
        }
        const date = new Date();
        console.log(`${date.toISOString()} ${this.name} ${level}${s}`, elements)
        this.history[level].push({ date, level, text: s, service: this.name })
        this.cb();
    }
    debug(...elements: any[]) {
        this.log('DEBUG', ...elements)
        this.debugCB();
    }
    info(...elements: any[]) {
        this.log('INFO', ...elements)
        this.infoCB();
    }
    warn(...elements: any[]) {
        this.log('WARN', ...elements)
        this.warnCB();
    }
    error(...elements: any[]) {
        this.log('ERROR', ...elements)
        this.errorCB();
    }
    debugCB = () => { return };
    infoCB = () => { return };
    warnCB = () => { return };
    errorCB = () => { return };
}