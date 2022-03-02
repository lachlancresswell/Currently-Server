import makeMdns from 'multicast-dns';

const mdns = makeMdns({ loopback: true });

/**
 * Validates given query questions or response answers
 * @param packet Query questions or resonse answer packet
 * @returns True if a calid MDNS packet, false if else
 */

export const validatePacket = (packet: { type: string }[], MDNS_RECORD_TYPE: string) => packet[0] && packet[0].type === MDNS_RECORD_TYPE;

export const attachQueryHandler = (MDNS_RECORD_TYPE: string, cb: any) => {
    mdns.once('query', (query) => {
        if (validatePacket(query.questions, MDNS_RECORD_TYPE)) {
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

export const end = () => {
    mdns.destroy();
}

export const attachResponseHandler = (MDNS_RECORD_TYPE: string, HTTP_MDNS_SERVICE_NAME: string, HTTPS_MDNS_SERVICE_NAME: string, cb: any) => {
    mdns.once('response', (response: any) => {
        if (validatePacket(response.answers, MDNS_RECORD_TYPE) && (response.answers[0].name === HTTP_MDNS_SERVICE_NAME || response.answers[0].name === HTTPS_MDNS_SERVICE_NAME)) {
            cb(response)
        } else {
            cb(-1)
        }
    })
}

export const sendUpdate = (HTTP_MDNS_SERVICE_NAME: string, HTTPS_MDNS_SERVICE_NAME: string, MDNS_DOMAIN: string, MDNS_RECORD_TYPE: string, HTTP_PORT: number, HTTPS_PORT: number, ips: string[], deviceName: string, MODBUS_GATEWAY_IP: string | undefined) => {
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