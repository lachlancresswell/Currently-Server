import * as os from 'os';

export interface NicInfo {
    name: string,
    ip: string,
    mask: string
}

const nets: any = os.networkInterfaces();

export const getAddresses = () => {
    let nicAddresses: NicInfo[] = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                const nic: NicInfo = { name: name, ip: net.address, mask: net.cidr };
                nicAddresses.push(nic);
            }
        }
    }
    return nicAddresses;
}
