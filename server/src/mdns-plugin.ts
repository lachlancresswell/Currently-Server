import makeMdns from 'multicast-dns';
import { Answer } from "dns-packet";
import * as Plugin from './plugin'
import * as os from 'os';
import * as Events from './events'

export const DEFAULT_HTTP_PORT = 8080;
export const DEFAULT_HTTPS_PORT = 8081;
export const DEFAULT_MDNS_DOMAIN = '.local'
export const DEFAULT_HTTP_MDNS_SERVICE_NAME = 'http-my-service';
export const DEFAULT_HTTPS_MDNS_SERVICE_NAME = 'https-my-service';
export const DEFAULT_SERVICE_NAME = 'my-service';
export const DEFAULT_MS = 20000;
export const DEFAULT_DISCOVER = true;
export const DEFAULT_ADVERTISE = true;
export const DEFAULT_DEVICE_NAME = 'Distro';


interface addressObj {
    ip: string,
    name: string,
    local: boolean,
    modbusIP: string,
}

interface NicInfo {
    name: string,
    ip: string,
    mask: string
}

const MDNS_RECORD_TYPE = 'SRV';

export interface Options extends Plugin.Options {
    HTTP_PORT?: number,
    HTTPS_PORT?: number,
    HTTP_MDNS_SERVICE_NAME?: string,
    HTTPS_MDNS_SERVICE_NAME?: string,
    SERVICE_NAME?: string,
    MDNS_DOMAIN?: string,
    ms: number;
    discover: boolean;
    advertise: boolean;
    device_name: string;
}

export class plugin extends Plugin.Instance {
    options!: Options;
    mdns: makeMdns.MulticastDNS;
    neighbours: { addresses: addressObj[] } = { addresses: [] };
    nicAddresses!: NicInfo[];
    nets: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
    ips: string[];
    timeout?: NodeJS.Timeout;

    constructor(app: any, options?: Options) {
        super(app, options);

        if (!this.options.HTTP_PORT) this.options.HTTP_PORT = DEFAULT_HTTP_PORT;
        if (!this.options.HTTPS_PORT) this.options.HTTPS_PORT = DEFAULT_HTTPS_PORT;
        if (!this.options.MDNS_DOMAIN) this.options.MDNS_DOMAIN = DEFAULT_MDNS_DOMAIN;
        if (!this.options.HTTP_MDNS_SERVICE_NAME) this.options.HTTP_MDNS_SERVICE_NAME = DEFAULT_HTTP_MDNS_SERVICE_NAME;
        if (!this.options.HTTPS_MDNS_SERVICE_NAME) this.options.HTTPS_MDNS_SERVICE_NAME = DEFAULT_HTTPS_MDNS_SERVICE_NAME;
        if (!this.options.SERVICE_NAME) this.options.SERVICE_NAME = DEFAULT_SERVICE_NAME;
        if (!this.options.ms) this.options.ms = DEFAULT_MS;
        if (!this.options.discover) this.options.discover = DEFAULT_DISCOVER;
        if (!this.options.advertise) this.options.advertise = DEFAULT_ADVERTISE;
        if (!this.options.device_name) this.options.device_name = DEFAULT_DEVICE_NAME;

        this.nets = os.networkInterfaces()!;
        this.getNicAddresses()!;
        this.mdns = makeMdns({ loopback: true });
        this.ips = this.nicAddresses.map(a => a.ip);
        this.attachQueryHandler(() => this.sendUpdate());

        const _this = this;
        this.attachResponseHandler((response: any) => {
            if ((response.answers[0].name === _this.options.HTTP_MDNS_SERVICE_NAME || response.answers[0].name === _this.options.HTTPS_MDNS_SERVICE_NAME)) {

                const incomingIP = _this.formatIPandPort(response)
                let name = response.answers[2].name;
                const modbusIP = response.answers[response.answers.length - 1].data;
                const domainLoc = name.indexOf('.local');
                if (domainLoc) name = name.substring(0, domainLoc)
                // Find if response is a loopback e.g the local device
                let local = _this.nicAddresses.some((address: { name: string, ip: string, mask: string | null }) => (address.ip === response.answers[2].data && /*_this.options.name === name &&*/ (response.answers[0].data.port === _this.options.HTTP_PORT || response.answers[1].data.port.toString === _this.options.HTTPS_PORT)));

                this.addNeighbour.bind(_this, name, incomingIP, local, modbusIP)();
            }
        })
    }

    load() {
        super.load();
        this.discoveryLoop();

        /**
         * Neighbouring server API endpoint
         */
        this.app.registerEndpoint('/neighbours', (req: any, res: any) => res.send(JSON.stringify(this.neighbours)))

        const _this = this;
        this.listen((Events.DEVICE_NAME_UPDATE), (res: string) => {
            const deviceName = res[0]
            _this.options.device_name = deviceName;
            _this.sendUpdate();
            //_this.neighbours.addresses.find((n) => n.local)!.name = this.options.name;
        })
    }

    /**
     * Destroys the current MDNS session
     * @returns Nothing
     */
    unload = () => new Promise((res) => {
        clearTimeout(this.timeout!);
        this.mdns.removeAllListeners();
        this.mdns.destroy(() => res('MDNS finished'))
    })

    formatIPandPort = (response: { answers: any[] }) => (response.answers[2].data as string) + ':' + response.answers[1].data.port;

    getNicAddresses = () => {
        let nicAddresses: NicInfo[] = [{ name: "localhost", ip: "127.0.0.1", mask: "0" }];
        for (const name of Object.keys(this.nets)) {
            for (const net of this.nets[name]!) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    const nic: NicInfo = { name: name, ip: net.address, mask: net.cidr! };
                    nicAddresses.push(nic);
                }
            }
        }
        this.nicAddresses = nicAddresses;
    }

    addNeighbour = (name: string, incomingIP: string, local: boolean, modbusIP = '0.0.0.0') => {
        // Check if incoming address is new or not
        if ((!this.neighbours.addresses.filter((address: addressObj) => (address.ip === incomingIP && address.local === local)).length)) {

            console.log(`Discovered ${name} @ ${incomingIP}`)

            const neighbourAddress = { ip: incomingIP, name, local, modbusIP };
            this.neighbours.addresses.push(neighbourAddress);
            this.announce(Events.NEIGHBOUR_DISCOVERED, neighbourAddress)
            const uri = incomingIP.replace(':', '/');

            const path = `${uri}`;
            this.app.registerEndpoint(path, (req: any, res: any) => {
                const target = "https://" + (req.url.substring(req.url.indexOf("/") + 1).replace("/", ':'));
                this.app.proxy(target, req, res);
            })
        }

        this.neighbours.addresses.sort((a, b) => a.local ? 1 : 0);
    }

    /**
     * Perform mdns query every ms milliseconds
     */
    discoveryLoop = () => {
        this.neighbours = { addresses: [] };
        if (this.options.advertise) this.sendQuery()
        this.timeout = setTimeout(() => { if (this.options.discover) this.discoveryLoop() }, this.options.ms)
    }

    /**
     * Validates given query questions or response answers
     * @param packet Query questions or resonse answer packet
     * @returns True if a calid MDNS packet, false if else
     */
    validatePacket = (packet: { type: string, name: string }[]) => packet[0] && packet[0].type === MDNS_RECORD_TYPE && (packet[0].name === this.options.HTTP_MDNS_SERVICE_NAME || packet[0].name === this.options.HTTPS_MDNS_SERVICE_NAME || packet[0].name === this.options.SERVICE_NAME);

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
     * Queries the network for services with the same name
     */
    sendQuery = () => this.mdns.query({
        questions: [{
            name: this.options.SERVICE_NAME!,
            type: 'SRV',
        }]
    })

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
    attachQueryHandler = (listener: any) => this.mdns.on('query', (query) => {
        if (this.validatePacket(query.questions)) {
            listener(query);
        }
    });

    /**
     * Advertises device information
     */
    sendUpdate = () => {
        const weight = 0;
        const priority = 10;
        let answers: Answer[] = [
            {
                name: this.options.HTTP_MDNS_SERVICE_NAME!,
                type: MDNS_RECORD_TYPE,
                data: {
                    port: this.options.HTTP_PORT!,
                    weight,
                    priority,
                    target: this.options.HTTP_MDNS_SERVICE_NAME! + this.options.MDNS_DOMAIN!
                }
            }, {
                name: this.options.HTTPS_MDNS_SERVICE_NAME!,
                type: MDNS_RECORD_TYPE,
                data: {
                    port: this.options.HTTPS_PORT!,
                    weight,
                    priority,
                    target: this.options.HTTPS_MDNS_SERVICE_NAME! + this.options.MDNS_DOMAIN!
                }
            }]

        this.ips.forEach((ipAddress: string) => {
            answers.push({
                name: this.options.device_name + this.options.MDNS_DOMAIN,
                type: 'A',
                data: ipAddress
            })
        });

        answers.push({
            name: 'modbus' + this.options.MDNS_DOMAIN,
            type: 'A',
            data: /*this.options.MODBUS_GATEWAY_IP ||*/ '0.0.0.0'
        })

        this.mdns.respond({ answers })
    }
}
