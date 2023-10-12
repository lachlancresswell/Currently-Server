import { useEffect } from 'react';
import { LocaleOptions } from '../../../Types';

export function usePhaseColors(pluginConfig: LocaleOptions) {
    useEffect(() => {
        document.body.dataset.locale = pluginConfig?.locale.value as string || 'au';
    }, [pluginConfig.locale.value])
}
