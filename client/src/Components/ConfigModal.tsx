import '../Styles/ConfigModal.css'
import { NumberModal } from './NumberModal';
import { IPv4Modal } from './IPv4Modal';
import { ConfigVariable } from '../../../Types';
import { KeyboardModal } from './KeyboardModal';
import { Setting } from '../Pages/NetworkSettingsWrapper';


export const Modal = ({ setting, onClose, onSubmit, updated }: { setting: Setting<any>, onClose: () => void, onSubmit: (setting: Setting) => void, updated?: boolean }) => {

    const handleSetting = (newSetting: ConfigVariable) => {
        onSubmit({
            ...setting,
            ...{ setting: newSetting }
        })
    }

    switch (setting.setting.type) {
        case 'ipaddress':
            return <IPv4Modal setting={setting.setting} onClose={onClose} onSubmit={handleSetting} updated={updated} />
        case 'string':
            return <KeyboardModal setting={setting.setting} onClose={onClose} onSubmit={handleSetting} updated={updated} />
        default:
            return <NumberModal setting={setting.setting} onClose={onClose} onSubmit={handleSetting} updated={updated} />
    }
}