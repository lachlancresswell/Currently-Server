import { useEffect } from 'react';
import { useConfigDataContext } from '../Hooks/configContext';

export function usePhaseColors() {
    const { configData } = useConfigDataContext();
    useEffect(() => {
        document.body.dataset.locale = configData?.locale?.config?.locale.value as string || 'au';
    }, [configData])
}
