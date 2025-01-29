import { Plugin } from './plugin';
import { Routing } from './server';
import { SystemOptions } from '../../Types';
import { exec, execSync } from 'child_process';

/**
 * Plugin for interfacing with the underlying linux system.
 * @extends Plugin
 */
class SystemPlugin extends Plugin<SystemOptions> {
    name = 'SystemPlugin';

    /**
     * System plugin constructor.
     * @param serverRouter - Express Router object from the server
     * @param options - System options
     */
    constructor(serverRouter: Routing, options: SystemOptions) {
        super(serverRouter, options);

        const _this = this;

        this.setEphemeralVariable(this.configuration.reboot, () => false, _this.restartSystem);
        this.setEphemeralVariable(this.configuration.memTotal, () => _this.getMemoryStats().total, () => false);
        this.setEphemeralVariable(this.configuration.memAvailable, () => _this.getMemoryStats().available, () => false);
        this.setEphemeralVariable(this.configuration.diskTotal, () => _this.getDiskStats().total, () => false);
        this.setEphemeralVariable(this.configuration.diskAvailable, () => _this.getDiskStats().available, () => false);
    }

    /**
     * Restarts the Linux system.
     */
    restartSystem = () => {
        exec('reboot -h now', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }

    /**
     * Gets the current memory values from the 'free' command
     * @returns Object containing total memory and available memory
     */
    getMemoryStats = () => {
        const buffer = execSync('free -m | grep Mem | awk \'{print $2, $7}\'');
        const [total, available] = buffer.toString().split(' ');

        return { total, available };
    }

    /**
     * Gets the current disk space values from the 'df' command
     * @returns Object containing total disk space and available disk space
     */
    getDiskStats = () => {
        const buffer = execSync(`df | grep ${this.configuration.diskPath.value} | awk \'{print $2, $4}\'`);
        const [total, available] = buffer.toString().split(' ');

        return { total, available };
    }
}

export default SystemPlugin;