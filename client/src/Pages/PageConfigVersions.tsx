// src/components/ConfigForm.tsx
import { SystemOptions } from '../../../Types';
import { useConfigContext } from '../Hooks/useConfig';
import '../Styles/PageConfigVersions.css';

const PLUGIN_NAME = 'SystemPlugin';

export const VersionSettings = () => {
    const { getPluginConfig } = useConfigContext();
    const pluginConfig = getPluginConfig<SystemOptions>(PLUGIN_NAME);

    const memTotal = (pluginConfig?.memTotal.value! / 1024).toFixed(2).toString() + 'gb';
    const memAvailable = (pluginConfig?.memAvailable.value! / 1024).toFixed(2).toString() + 'gb';
    const diskTotal = (pluginConfig?.diskTotal.value! / (1024000)).toFixed(2).toString() + 'gb';
    const diskAvailable = (pluginConfig?.diskAvailable.value! / (1024000)).toFixed(2).toString() + 'gb';

    return (
        <div className="gridVersions">
            <Title title={'Firmware:'} />
            <Value value={'0.1.23 (beta)'} />
            <Title title={'Available Memory:'} />
            <Value value={`${memAvailable}/${memTotal}`} />
            <Title title={'Available Disk:'} />
            <Value value={`${diskAvailable}/${diskTotal}`} />
        </div>
    )
}

const Title = ({ title }: { title?: string }) => {
    return (
        <div className={`span-four-versions versions-title`}>
            {title}
        </div>
    )
}

const Value = ({ value }: { value?: string }) => {
    return (
        <div className={`span-six-versions versions-value`}>
            {value}
        </div>
    )
};