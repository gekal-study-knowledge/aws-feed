'use client';

import * as React from 'react';
import { useColorScheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';

export default function ThemeSwitcher() {
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleClose();
  };

  if (!mode) {
    return (
      <IconButton size="large" color="inherit" disabled>
        <SettingsBrightnessIcon />
      </IconButton>
    );
  }

  const getIcon = () => {
    if (mode === 'light') return <LightModeIcon />;
    if (mode === 'dark') return <DarkModeIcon />;
    return <SettingsBrightnessIcon />;
  };

  return (
    <React.Fragment>
      <Tooltip title="テーマ切り替え">
        <IconButton
          onClick={handleClick}
          size="large"
          color="inherit"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="theme-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem selected={mode === 'light'} onClick={() => handleModeChange('light')}>
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ライト</ListItemText>
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={() => handleModeChange('dark')}>
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ダーク</ListItemText>
        </MenuItem>
        <MenuItem selected={mode === 'system'} onClick={() => handleModeChange('system')}>
          <ListItemIcon>
            <SettingsBrightnessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>システム</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
