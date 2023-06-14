import { useState } from 'react';
import { PageConfigNetwork } from './PageConfigNetwork';
import { Modal } from '../Components/ConfigModal';
import { useConfig } from '../Hooks/useConfig';
import { ConfigVariable, IPOptions } from '../../../Types';

const NetworkSettingsWrapper = () => {
  const [selectedSetting, setSelectedSetting] = useState<ConfigVariable>();
  const [updated, setUpdated] = useState<boolean>(false)
  const { pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, isModified } = useConfig<IPOptions>('IPPlugin');

  const onSettingClick = (setting: ConfigVariable, updated = false) => {
    setSelectedSetting(setting);
    setUpdated(updated);
  };

  const handleFullscreenUIClose = () => setSelectedSetting(undefined);

  const handleFullscreenUISubmit = (setting: ConfigVariable) => {
    setSelectedSetting(undefined);
    handleInputChange(setting.key, setting.value);
  };

  return (
    <>
      {!selectedSetting ?
        <PageConfigNetwork onSettingClick={onSettingClick} configObj={{ pluginConfig, selectedNeighbour, handleInputChange, handleConfirm, isModified }} />
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