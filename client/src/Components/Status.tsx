import { IPOptions } from '../../../Types';
import { useNeighbourContext } from '../Hooks/neighbourContext';
import { useNeighbourDataContext } from '../Hooks/neighbourDataContext';
import { useConfigContext } from '../Hooks/useConfig';

const PLUGIN_NAME = 'IPPlugin';

export const Status: React.FC = () => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const { getPluginConfig } = useConfigContext();
    const pluginData = getPluginConfig<IPOptions>(PLUGIN_NAME);

    let color = 'grey';

    if (selectedNeighbour && pluginData) {
        color = 'yellow';
        if (neighbourData) {
            color = 'green';
            if (pluginData.internetStatus?.value) {
                color = 'purple';
            }
        }
    }

    return (<div style={{
        backgroundColor: color,
        height: '2px'
    }}>
    </div >)
}