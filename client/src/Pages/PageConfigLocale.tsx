import { LocaleOptions } from "../../../Types";
import { useConfigContext } from '../Hooks/useConfig';
import '../Styles/PageConfigLocale.css';
import { MouseEventHandler, useState } from "react";

const PLUGIN_NAME = 'LocalePlugin';

export const LocaleSettings = () => {
    const { getPluginConfig, isModified, handleInputChange } = useConfigContext();

    const [pluginConfig, setPluginConfig] = useState<LocaleOptions | undefined>(getPluginConfig<LocaleOptions>(PLUGIN_NAME));
    const [startPluginConfig, setStartPluginConfig] = useState<LocaleOptions | undefined>(getPluginConfig<LocaleOptions>(PLUGIN_NAME));

    const getCountryName = (locale?: string): string => {
        switch (locale) {
            case 'au':
                return 'Australia';
            case 'eu':
                return 'Europe';
            case 'us':
                return 'United States';
            case 'ca':
                return 'Canada';
            default:
                return '';
        }
    }

    const onChange = (key: string, value: any, push = false) => handleInputChange<LocaleOptions>(pluginConfig!, key, value, push, PLUGIN_NAME, [pluginConfig, setPluginConfig], [startPluginConfig, setStartPluginConfig])

    const countryString = getCountryName(pluginConfig?.locale.value)

    return (
        <div className="gridLocale">
            <div className={`span-five-locale`}>
                COUNTRY
            </div>
            <div className={`span-five-locale`}>
                {countryString}
            </div>
            <div className={`span-five-locale`}>
                Phase Colours
            </div>
            <PhaseTrafficLights locale={pluginConfig?.locale.value} />
            <PhaseTrafficLights locale={'au'} description='AU/NZ' handleInputChange={() => onChange('locale', 'au', true)} />
            <PhaseTrafficLights locale={'eu'} description='EU/UK' handleInputChange={() => onChange('locale', 'eu', true)} />
            <PhaseTrafficLights locale={'us'} description='USA' handleInputChange={() => onChange('locale', 'us', true)} />
            <PhaseTrafficLights locale={'ca'} description='CAN' handleInputChange={() => onChange('locale', 'ca', true)} />
        </div>
    )
}

const PhaseTrafficLights = ({
    locale,
    description,
    handleInputChange
}: {
    locale?: 'au' | 'eu' | 'us' | 'ca',
    description?: 'AU/NZ' | 'EU/UK' | 'USA' | 'CAN',
    handleInputChange?: MouseEventHandler<HTMLDivElement>
}) => {
    return (<div className={`span-five-locale locale-width-100`} onClick={handleInputChange}>
        <div className='locale-traffic-lights locale-width-100'>
            <div className={`locale-traffic-lights-l1-${locale}`} />
            <div className={`locale-traffic-lights-l2-${locale}`} />
            <div className={`locale-traffic-lights-l3-${locale}`} />
            {description && <div className='locale-country-id'>{description}</div>}
        </div>
    </div>)
}