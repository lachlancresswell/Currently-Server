// src/components/ConfigForm.tsx
import '../Styles/PageConfigSystem.css';
import { SystemOptions } from '../../../Types';
import { useConfig } from '../Hooks/useConfig';

export const SystemSettings = ({ }: {}) => {
    const { pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, isModified } = useConfig<SystemOptions>('SystemPlugin');

    const onClick = () => {
        pluginConfig!.reboot.value = true;
        handleConfirm();
    }

    return (
        <div className="gridSystem">
            <button onClick={onClick}>Restart</button>
        </div >
    )
}
