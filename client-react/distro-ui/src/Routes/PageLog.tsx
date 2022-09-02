import React from 'react'
import { Logger, Message } from '../log';


export default function PageLog({ logs, attention, onLoad }: { logs: { app: Logger, mdns: Logger }, attention: boolean, onLoad: any }) {
    if (attention) onLoad();

    let log: Message[] = [];

    const getUnique = (a: Message[]) => {
        const unique: Message[] = [];
        a.forEach((val, i, array) => {
            const len = unique.length - 1;
            if (i > 0) {
                if (unique[len].text !== val.text) {
                    unique.push(val)
                } else {
                    unique[len] = val;
                }
            } else {
                unique.push(val)
            }
        })

        return unique;
    }

    const loggers = [logs.app.history, logs.mdns.history];

    loggers.forEach((l) => log.push(...getUnique(l.DEBUG)));
    loggers.forEach((l) => log.push(...getUnique(l.INFO)));
    loggers.forEach((l) => log.push(...getUnique(l.WARN)));
    loggers.forEach((l) => log.push(...l.ERROR));

    log = log.sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="log" style={{
            width: '95%', height: '75%', margin: '1em', overflowX: 'scroll', overflowY: 'scroll', whiteSpace: 'nowrap'
        }} >
            {log.map((m) => {
                return <samp style={{ display: 'block' }}>
                    {m.date.toLocaleTimeString() + ' '}
                    <span className={m.service}>{m.service}</span>
                    <span> </span>
                    <span className={m.level}>{m.level}</span>
                    <span> </span>
                    <span>{m.text}</span>
                </samp>
            })}
        </div >
    );
}
