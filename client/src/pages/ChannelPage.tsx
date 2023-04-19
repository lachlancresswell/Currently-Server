import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import {
    Adjust as BasicIcon,
    Filter1 as L1Icon,
    Filter2 as L2Icon,
    Filter3 as L3Icon,
    Speed as AdvIcon,
} from '@mui/icons-material';

const ChannelPage: React.FC = () => {
    const [value, setValue] = useState(0);

    const getContent = () => {
        switch (value) {
            case 0:
                return <div>Basic Channel Content</div>;
            case 1:
                return <div>L1 Channel Content</div>;
            case 2:
                return <div>L2 Channel Content</div>;
            case 3:
                return <div>L3 Channel Content</div>;
            case 4:
                return <div>Advanced Channel Content</div>;
            default:
                return <div>Basic Channel Content</div>;
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box flexGrow={1}>{getContent()}</Box>
            <BottomNavigation
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
                showLabels
            >
                <BottomNavigationAction label="Basic" icon={<BasicIcon />} />
                <BottomNavigationAction label="L1" icon={<L1Icon />} />
                <BottomNavigationAction label="L2" icon={<L2Icon />} />
                <BottomNavigationAction label="L3" icon={<L3Icon />} />
                <BottomNavigationAction label="Adv" icon={<AdvIcon />} />
            </BottomNavigation>
        </div>
    );
};

export default ChannelPage;
