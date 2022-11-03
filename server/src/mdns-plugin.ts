import makeMdns from 'multicast-dns';
import { Answer, SrvAnswer } from "dns-packet";
import * as Plugin from './plugin'
import * as os from 'os';
import * as Events from './events'
import * as Server from './server'
import { RemoteInfo } from 'dgram';

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
    secure: boolean,
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
    discover: Plugin.ClientOption<boolean>;
    advertise: boolean;
    device_name: Plugin.ClientOption<string>;
}

const defaultOptions: Options = {
    HTTP_PORT: DEFAULT_HTTP_PORT,
    HTTPS_PORT: DEFAULT_HTTPS_PORT,
    MDNS_DOMAIN: DEFAULT_MDNS_DOMAIN,
    HTTP_MDNS_SERVICE_NAME: DEFAULT_HTTP_MDNS_SERVICE_NAME,
    HTTPS_MDNS_SERVICE_NAME: DEFAULT_HTTPS_MDNS_SERVICE_NAME,
    SERVICE_NAME: DEFAULT_SERVICE_NAME,
    ms: DEFAULT_MS,
    discover: { priority: 1, readableName: 'Discoverable', value: DEFAULT_DISCOVER, restart: 'restart-plugin' },
    advertise: DEFAULT_ADVERTISE,
    device_name: { priority: 1, readableName: 'Device Name', value: DEFAULT_DEVICE_NAME, restart: 'restart-plugin' }
}

export class plugin extends Plugin.Instance {
    options!: Options;
    mdns: makeMdns.MulticastDNS;
    neighbours: { addresses: addressObj[] } = { addresses: [] };
    nicAddresses!: NicInfo[];
    nets: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
    ips: string[];
    timeout?: NodeJS.Timeout;

    constructor(app: Server.default, options?: Options, name?: string) {
        super(app, options, name, defaultOptions);

        this.nets = os.networkInterfaces()!;
        this.getNicAddresses()!;
        this.mdns = makeMdns({ loopback: true });
        this.ips = this.nicAddresses.map(a => a.ip);
        this.attachQueryHandler(() => this.sendUpdate());

        const _this = this;
        this.attachResponseHandler((response: { answers: Answer[] }) => {
            const distroServers = response.answers.filter((a) => a.type === 'SRV' && a.name === _this.options.HTTP_MDNS_SERVICE_NAME || a.name === _this.options.HTTPS_MDNS_SERVICE_NAME)
            if (distroServers) {
                distroServers.forEach((s) => {
                    const ip = (response.answers[2] as any).data;
                    const incomingIP = ip + ':' + (s as any).data!.port;
                    const secure = s.name.indexOf('https') > -1 ? true : false;

                    let name = response.answers[2].name;
                    const modbusIP = (response.answers[response.answers.length - 1] as any).data || '0.0.0.0';
                    const domainLoc = name.indexOf('.local');
                    if (domainLoc) name = name.substring(0, domainLoc)
                    // Find if response is a loopback e.g the local device
                    let local = _this.nicAddresses.some((address: { name: string, ip: string, mask: string | null }) => (address.ip === ip && /*_this.options.name === name &&*/ ((s as any).data.port! === _this.options.HTTP_PORT || (s as any).data.port.toString === _this.options.HTTPS_PORT)));

                    this.addNeighbour.bind(_this, { name, incomingIP, local, modbusIP, secure })();
                })
            }
        })
    }

    load() {
        super.load();
        this.discoveryLoop();

        /**
         * Neighbouring server API endpoint
         */
        const route = '/neighbours';
        this.registerGetRoute(route, (req: any, res: any) => this.getNeighbours(req, res, this))

        const _this = this;
        this.listen((Events.DEVICE_NAME_UPDATE), (res: string) => {
            const deviceName = res[0]
            _this.options.device_name.value = deviceName;
            _this.sendUpdate();
            //_this.neighbours.addresses.find((n) => n.local)!.name = this.options.name;
        })
    }

    getNeighbours = (_req: any, res: { send: (arg0: string) => any; }, _this: any) => res.send(JSON.stringify(_this.neighbours));

    /**
     * Destroys the current MDNS session
     * @returns Nothing
     */
    unload() {
        super.unload();
        return new Promise((res) => {
            //this.routes?.forEach((r) => this.app.removeRoute(r))
            clearTimeout(this.timeout!);
            this.mdns.removeAllListeners();
            this.mdns.destroy(() => res('MDNS finished'))
        })
    }

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

    addNeighbour = (obj: { name: string, incomingIP: string, local: boolean, modbusIP: string, secure: boolean }) => {
        // Check if incoming address is new or not
        if ((!this.neighbours.addresses.filter((address: addressObj) => (address.ip === obj.incomingIP && address.local === obj.local)).length)) {
            console.log(`Discovered ${obj.name} @ ${obj.incomingIP}`)

            const neighbourAddress = { ip: obj.incomingIP, name: obj.name, local: obj.local, modbusIP: obj.modbusIP, secure: obj.secure };
            this.neighbours.addresses.push(neighbourAddress);
            this.announce(Events.NEIGHBOUR_DISCOVERED, neighbourAddress)
            const uri = obj.incomingIP.replace(':', '/');

            const path = `/${uri}/*`;
            this.registerAllRoute(path, (req, res) => {
                const protocol = (req.socket as any).encrypted ? 'https://' : 'http://'

                let p = req.url;
                p = p.substring(p.indexOf('/', 1));
                p = p.substring(p.indexOf('/', 1));
                let path = (req.url.substring(req.url.indexOf("/") + 1).replace("/", ':'))
                path = (req.url.substring(req.url.indexOf("/") + 1).replace("/", ':')).substring(0, path.indexOf('/'));
                req.url = p;
                const target = protocol + path;
                console.log('Proxying to - ' + target)
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
        this.timeout = setTimeout(() => { if (this.options.discover.value) this.discoveryLoop() }, this.options.ms)
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
    removeResponseListener = (listener: (response: makeMdns.ResponsePacket, rinfo: RemoteInfo) => void) => this.mdns.removeListener('response', listener);

    /**
     * Removes an MDNS query listener
     * @param listener Function currently attached as a listener
     * @returns Nothing
     */
    removeQueryListener = (listener: (query: makeMdns.QueryPacket, rinfo: RemoteInfo) => void) => this.mdns.removeListener('query', listener);

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
    attachResponseHandler = (listener: { (response: { answers: Answer[]; }): void; (arg0: makeMdns.ResponsePacket): void; }) => {
        const parent = this;
        this.mdns.on('response', (response) => {
            if (parent.validatePacket(response.answers)) {
                listener(response)
            }
        })
    }

    /**
     * Attaches a listener to query events
     * @param listener Listener funciton to attach
     */
    attachQueryHandler = (listener: { (): void; (arg0: makeMdns.QueryPacket): void; }) => this.mdns.on('query', (query) => {
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
                name: this.options.device_name.value + this.options.MDNS_DOMAIN!,
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
