import makeMdns from 'multicast-dns';
import { Answer } from "dns-packet";


export interface Options {
    HTTP_PORT?: number,
    HTTPS_PORT?: number,
    HTTP_MDNS_SERVICE_NAME?: string,
    HTTPS_MDNS_SERVICE_NAME?: string,
    SERVICE_NAME?: string,
    MDNS_DOMAIN?: string,
    MDNS_RECORD_TYPE?: string,
}

export class Mdns {
    options: Options;
    mdns: makeMdns.MulticastDNS;

    constructor(options?: Options) {

        // Default config
        this.options = {
            HTTP_PORT: 8080,
            HTTPS_PORT: 8081,
            MDNS_DOMAIN: '.local',
            HTTP_MDNS_SERVICE_NAME: 'http-my-service',
            HTTPS_MDNS_SERVICE_NAME: 'https-my-service',
            SERVICE_NAME: 'my-service',
            MDNS_RECORD_TYPE: 'SRV',
        };

        // Overwrite default with user provided options
        Object.assign(this.options, options);

        this.mdns = makeMdns({ loopback: true });
    }

    /**
     * Validates given query questions or response answers
     * @param packet Query questions or resonse answer packet
     * @returns True if a calid MDNS packet, false if else
     */
    validatePacket = (packet: { type: string, name: string }[]) => packet[0] && packet[0].type === this.options.MDNS_RECORD_TYPE && (packet[0].name === this.options.HTTP_MDNS_SERVICE_NAME || packet[0].name === this.options.HTTPS_MDNS_SERVICE_NAME || packet[0].name === this.options.SERVICE_NAME);

    /**
     * Removes an MDNS response listener
     * @param listener Function currently attached as a listener
     * @returns Nothing
     */
    removeResponseListener = (listener: any) => this.mdns.removeListener('response', listener);

    /**
     * Removes an MDNS query listener
     * @param listener Function currently attached as a listener
     * @returns Nothing
     */
    removeQueryListener = (listener: any) => this.mdns.removeListener('query', listener);

    /**
     * Destroys the current MDNS session
     * @returns Nothing
     */
    end = () => this.mdns.destroy();

    /**
     * Queries the network for services with the same name
     */
    sendQuery = () => {
        this.mdns.query({
            questions: [{
                name: this.options.SERVICE_NAME!,
                type: 'SRV',
            }]
        })
    }

    /**
     * Attaches a listener to response events
     * @param listener Listener function to attach 
     */
    attachResponseHandler = (listener: any) => {
        const parent = this;
        this.mdns.on('response', (response: any) => {
            if (parent.validatePacket(response.answers)) {
                listener(response)
            }
        })
    }

    /**
     * Attaches a listener to query events
     * @param listener Listener funciton to attach
     */
    attachQueryHandler = (listener: any) => {
        this.mdns.on('query', (query) => {
            if (this.validatePacket(query.questions)) {
                listener(query);
            }
        });
    }

    /**
     * Advertises device information
     * @param ips List of device IPs server is available on
     * @param deviceName Name of device
     * @param MODBUS_GATEWAY_IP IP of the modbus gateway
     */
    sendUpdate = (ips: string[], deviceName: string, MODBUS_GATEWAY_IP?: string) => {
        const type = "SRV";
        const weight = 0;
        const priority = 10;
        let answers: Answer[] = [
            {
                name: this.options.HTTP_MDNS_SERVICE_NAME!,
                type,
                data: {
                    port: this.options.HTTP_PORT!,
                    weight,
                    priority,
                    target: this.options.HTTP_MDNS_SERVICE_NAME! + this.options.MDNS_DOMAIN!
                }
            }, {
                name: this.options.HTTPS_MDNS_SERVICE_NAME!,
                type,
                data: {
                    port: this.options.HTTPS_PORT!,
                    weight,
                    priority,
                    target: this.options.HTTPS_MDNS_SERVICE_NAME! + this.options.MDNS_DOMAIN!
                }
            }]

        ips.forEach((ipAddress: string) => {
            answers.push({
                name: deviceName + this.options.MDNS_DOMAIN,
                type: 'A',
                data: ipAddress
            })
        });

        answers.push({
            name: 'modbus' + this.options.MDNS_DOMAIN,
            type: 'A',
            data: MODBUS_GATEWAY_IP || '0.0.0.0'
        })

        this.mdns.respond({ answers })
    }
}
