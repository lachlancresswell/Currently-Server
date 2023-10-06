import { Plugin } from './plugin';
import { Routing } from './server';
import { SystemOptions } from '../../Types';
import { exec } from 'child_process';

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
    }

    /**
     * Restarts the Linux system.
     */
    restartSystem = () => {
        exec('sudo reboot -h now', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }
}

export default SystemPlugin;