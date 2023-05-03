import { useNeighbourContext } from './neighbourContext';
import { useNeighbourDataContext } from './neighbourDataContext';
import { useConfigDataContext } from './configContext';


export const Status: React.FC = () => {
    const { selectedNeighbour } = useNeighbourContext();
    const { neighbourData } = useNeighbourDataContext();
    const { configData } = useConfigDataContext();

    let color = 'grey';

    if (selectedNeighbour) {
        color = 'yellow';
        if (neighbourData) {
            color = 'green';
            if (configData?.IPPlugin?.config?.internetStatus?.value) {
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