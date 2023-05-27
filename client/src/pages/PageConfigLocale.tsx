import { LocaleOptions } from "../../../Types";
import { useConfig } from "./ConfigForm";
import '../Styles/PageConfigLocale.css';
import { MouseEventHandler } from "react";

export const LocaleSettings = () => {
    const { pluginConfig, selectedNeighbour, handleInputChange } = useConfig<LocaleOptions>('LocalePlugin');

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
            <PhaseTrafficLights locale={'au'} description='AU/NZ' handleInputChange={() => handleInputChange('locale', 'au', true)} />
            <PhaseTrafficLights locale={'eu'} description='EU/UK' handleInputChange={() => handleInputChange('locale', 'eu', true)} />
            <PhaseTrafficLights locale={'us'} description='USA' handleInputChange={() => handleInputChange('locale', 'us', true)} />
            <PhaseTrafficLights locale={'ca'} description='CAN' handleInputChange={() => handleInputChange('locale', 'ca', true)} />
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
    return (<div className={`span-five-locale locale-width-100`}>
        <div className='locale-traffic-lights locale-width-100'>
            <div className={`locale-traffic-lights-l1-${locale}`} onClick={handleInputChange} />
            <div className={`locale-traffic-lights-l2-${locale}`} onClick={handleInputChange} />
            <div className={`locale-traffic-lights-l3-${locale}`} onClick={handleInputChange} />
            {description && <div className='locale-country-id'>{description}</div>}
        </div>
    </div>)
}