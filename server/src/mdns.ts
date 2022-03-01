import makeMdns from 'multicast-dns';

const MDNS_RECORD_TYPE = 'SRV';

const mdns = makeMdns({ loopback: true });

/**
 * Validates given query questions or response answers
 * @param packet Query questions or resonse answer packet
 * @returns True if a calid MDNS packet, false if else
 */

export const validatePacket = (packet: { type: string }[]) => packet[0] && packet[0].type === MDNS_RECORD_TYPE;

export const attachResponseHandler = (cb: any) => {
    mdns.once('response', cb);
};

export const attachQueryHandler = (cb: any) => {
    mdns.once('query', (query) => {
        if (validatePacket(query.questions)) {
            cb(query);
        }
    });
}

export const sendQuery = (SERVICE_NAME: string, MDNS_RECORD_TYPE: any) => {
    mdns.query({
        questions: [{
            name: SERVICE_NAME,
            type: MDNS_RECORD_TYPE
        }]
    })
}

export const sendUpdate = (HTTP_MDNS_SERVICE_NAME: string, HTTPS_MDNS_SERVICE_NAME: string, MDNS_DOMAIN: string, HTTP_PORT: number, HTTPS_PORT: number, ips: string[], deviceName: string, MODBUS_GATEWAY_IP: string | undefined) => {
    const type = MDNS_RECORD_TYPE;
    const weight = 0;
    const priority = 10;
    let answers: any = [
        {
            name: HTTP_MDNS_SERVICE_NAME,
            type,
            data: {
                port: HTTP_PORT,
                weight,
                priority,
                target: HTTP_MDNS_SERVICE_NAME + MDNS_DOMAIN
            }
        }, {
            name: HTTPS_MDNS_SERVICE_NAME,
            type,
            data: {
                port: HTTPS_PORT,
                weight,
                priority,
                target: HTTPS_MDNS_SERVICE_NAME + MDNS_DOMAIN
            }
        }]

    ips.forEach((ipAddress: string) => {
        answers.push({
            name: deviceName + MDNS_DOMAIN,
            type: 'A',
            data: ipAddress
        })
    });

    answers.push({
        name: 'modbus' + MDNS_DOMAIN,
        type: 'A',
        data: MODBUS_GATEWAY_IP || '0.0.0.0'
    })

    mdns.respond({ answers })
}