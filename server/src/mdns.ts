const MDNS_RECORD_TYPE = 'SRV';

/**
 * Validates given query questions or response answers
 * @param packet Query questions or resonse answer packet
 * @returns True if a calid MDNS packet, false if else
 */

export const validatePacket = (packet: { type: string }[]) => packet[0] && packet[0].type === MDNS_RECORD_TYPE;