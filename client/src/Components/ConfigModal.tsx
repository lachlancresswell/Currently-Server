import '../Styles/ConfigModal.css'
import { NumberModal } from './NumberModal';
import { IPv4Modal } from './IPv4Modal';
import { ConfigVariable } from '../../../Types';


export const Modal = ({ setting, onClose, onSubmit, updated }: { setting: ConfigVariable, onClose: () => void, onSubmit: (setting: ConfigVariable) => void, updated?: boolean }) => {
    switch (setting.type) {
        case 'ipaddress':
            return <IPv4Modal setting={setting} onClose={onClose} onSubmit={onSubmit} updated={updated} />
        default:
            return <NumberModal setting={setting} onClose={onClose} onSubmit={onSubmit} updated={updated} />
    }
}