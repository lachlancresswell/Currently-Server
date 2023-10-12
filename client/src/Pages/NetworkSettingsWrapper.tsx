import { useState } from 'react';
import { PageConfigNetwork } from './PageConfigNetwork';
import { Modal } from '../Components/ConfigModal';
import { ConfigVariable, IPOptions, MDNSConfig } from '../../../Types';
import { useConfigContext } from '../Hooks/useConfig';

const IP_PLUGIN_NAME = 'IPPlugin';
const MDNS_PLUGIN_NAME = 'MDNSPlugin';

export interface Setting<T = any> {
  pluginName: String,
  setting: ConfigVariable<T>,
  key: string
}

const NetworkSettingsWrapper = () => {
  const { getPluginConfig, savePluginConfig } = useConfigContext();

  const [selectedSetting, setSelectedSetting] = useState<Setting>();
  const [updated, setUpdated] = useState<boolean>(false)

  const ipPluginState = useState<IPOptions | undefined>(getPluginConfig<IPOptions>(IP_PLUGIN_NAME))
  const ipPluginStateStart = useState<IPOptions | undefined>(getPluginConfig<IPOptions>(IP_PLUGIN_NAME))
  const mdnsPluginState = useState<MDNSConfig | undefined>(getPluginConfig<MDNSConfig>(MDNS_PLUGIN_NAME));
  const mdnsPluginStateStart = useState<MDNSConfig | undefined>(getPluginConfig<MDNSConfig>(MDNS_PLUGIN_NAME));

  function onSettingClick<T>(setting: Setting<T>, updated = false) {
    setSelectedSetting(setting);
    setUpdated(updated);
  };

  const handleFullscreenUIClose = () => setSelectedSetting(undefined);

  const handleFullscreenUISubmit = (setting: Setting) => {
    setSelectedSetting(undefined);

    if (setting.pluginName === IP_PLUGIN_NAME) {
      ipPluginState[1]((prevState: any) => {
        return {
          ...prevState,
          ... {
            [setting.key]: setting.setting
          }
        }
      })
    } else if (setting.pluginName === MDNS_PLUGIN_NAME) {
      mdnsPluginState[1]((prevState: any) => {
        return {
          ...prevState,
          ... {
            [setting.key]: setting.setting
          }
        }
      })
    }
  };

  const handleConfirm = () => {
    if (ipPluginState[0] && mdnsPluginState[0]) {
      savePluginConfig<[IPOptions, MDNSConfig]>([ipPluginState[0], mdnsPluginState[0]], [IP_PLUGIN_NAME, MDNS_PLUGIN_NAME]);

      ipPluginStateStart[1](ipPluginState[0]);
      mdnsPluginStateStart[1](mdnsPluginState[0]);
    }

  }

  /**
     * Checks if the plugin config has been modified.
     * @param keys Optional array of keys to watch.
     * @returns boolean
     */
  const isModified = (pluginName: string, pluginConfig: IPOptions | MDNSConfig | undefined, keys?: string[]) => {
    let startPluginConfig: IPOptions | MDNSConfig | undefined;

    switch (pluginName) {
      case IP_PLUGIN_NAME:
        startPluginConfig = ipPluginStateStart[0];
        break;
      case MDNS_PLUGIN_NAME:
        startPluginConfig = mdnsPluginStateStart[0];
        break;
    }

    let filteredStartPluginConfig = startPluginConfig;
    let filteredPluginConfig = pluginConfig;

    if (keys && startPluginConfig && pluginConfig) {
      filteredStartPluginConfig = Object.keys(startPluginConfig)
        .filter((key) => keys.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = startPluginConfig![key];
          return obj;
        }, {});

      filteredPluginConfig = Object.keys(pluginConfig)
        .filter((key) => keys.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = pluginConfig[key];
          return obj;
        }, {});
    }

    return (
      JSON.stringify(filteredStartPluginConfig) !== JSON.stringify(filteredPluginConfig)
    );
  };

  return (
    <>
      {!selectedSetting ?
        <PageConfigNetwork onSettingClick={onSettingClick} isModified={isModified} handleConfirm={handleConfirm} configObj={{ ipPluginState, mdnsPluginState }} />
        : (
          <Modal
            setting={selectedSetting}
            onClose={handleFullscreenUIClose}
            onSubmit={handleFullscreenUISubmit}
            updated={updated}
          />
        )}
    </>
  );
};

export default NetworkSettingsWrapper;