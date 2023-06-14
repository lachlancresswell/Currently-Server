// src/components/ConfigForm.tsx
import { TZOptions } from '../../../Types';
import '../Styles/PageConfigTimezone.css';
import { useConfig } from '../Hooks/useConfig';

export const TimezoneSettings = () => {
    const { pluginConfig, handleInputChange, handleConfirm, isModified } = useConfig<TZOptions>('TimeZonePlugin');

    const selectedCountry = countryFromTimezone(pluginConfig?.timezone.value || '')
    const cities = timezonesFromCountry(selectedCountry, pluginConfig?.timezone.options || []);
    const selectedCity = cityFromTimezone(pluginConfig?.timezone.value || '')

    return (
        <div className="gridTimezone">
            <Title title={'Country'} />
            <div className={`span-six-timezone timezone-value`}>
                <select value={selectedCountry} onChange={(e) => {
                    const possibleTimezones = timezonesFromCountry(e.target.value, pluginConfig?.timezone.options || []);
                    const tz = possibleTimezones ? possibleTimezones[0] : [];
                    handleInputChange('timezone', tz)
                }}>
                    {pluginConfig?.timezoneCountry.options?.map(country =>
                        <option key={country} value={country}>
                            {country}
                        </option>
                    )}
                </select>
            </div>
            <Title title={'City'} />
            <div className={`span-six-timezone timezone-value`}>
                <select value={selectedCity} onChange={(e) => {
                    handleInputChange('timezone', `${selectedCountry}/${e.target.value}`)
                }}>
                    {cities?.map((timezone) => {
                        const city = cityFromTimezone(timezone)
                        return <option key={city} value={city}>
                            {city}
                        </option>
                    })}
                </select>
            </div>
            <Title title={'Time'} />
            <Value value={pluginConfig?.time.value} />
            <Title title={'Date'} />
            <Value value={pluginConfig?.date.value} />
            <Title title={'Format'} />
            <div className={`span-six-timezone timezone-value`}>
                {pluginConfig?.dateFormat.value === 'dmy'}
                <span className={`${pluginConfig?.dateFormat.value === 'dmy' ? 'timezone-selected' : 'timezone-not-selected'}`} onClick={() => handleInputChange('dateFormat', 'dmy', true)}>DMY</span>
                <span className={`${pluginConfig?.dateFormat.value === 'mdy' ? 'timezone-selected' : 'timezone-not-selected'}`} onClick={() => handleInputChange('dateFormat', 'mdy', true)}>MDY</span>
                <span className={`${pluginConfig?.timeFormat.value === '24h' ? 'timezone-selected' : 'timezone-not-selected'}`} onClick={() => handleInputChange('timeFormat', '24h', true)}>24H</span>
                <span className={`${pluginConfig?.timeFormat.value === '12h' ? 'timezone-selected' : 'timezone-not-selected'}`} onClick={() => handleInputChange('timeFormat', '12h', true)}>12H</span>
            </div>
            <div className={`span-nine-timezone`} />
            <div className={`span-one-timezone`}>
                <div className='timezone-accept' onClick={handleConfirm}>
                    {isModified(['timezone']) ? 'ACCEPT' : ''}
                </div>
            </div>
        </div>
    )
}

const Title = ({ title }: { title?: string }) => {
    return (
        <div className={`span-four-timezone timezone-title`}>
            {title}
        </div>
    )
}

const Value = ({ value }: { value?: string }) => {
    return (
        <div className={`span-six-timezone timezone-value`}>
            {value}
        </div>
    )
};

/**
 * Returns the city portion of a city/country formatted timezone string
 * @param timezone 'City/Country' format timezone string
 * @returns The city portion
 */
const countryFromTimezone = (timezone: string) => {
    const firstForwardSlash = timezone.indexOf('/');
    return timezone.substring(0, firstForwardSlash)
}

/**
 * Returns the country portion of a city/country formatted timezone string
 * @param timezone 'City/Country' format timezone string
 * @returns The country portion
 */
const cityFromTimezone = (timezone: string) => {
    const firstForwardSlash = timezone.indexOf('/');
    return timezone.substring(firstForwardSlash + 1)
}

/**
 * Filters an array of timezones to those that are from a given country
 * @param country Country to search for
 * @param timezones String array of city/country formatted timezone strings
 * @returns String array of city/country formatted timezone strings that match the provided country
 */
const timezonesFromCountry = (country: string, timezones: string[]) => {
    return timezones.filter((tz) => tz.startsWith(country))
}