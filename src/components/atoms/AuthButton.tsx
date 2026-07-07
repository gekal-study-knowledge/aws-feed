'use client';

import * as React from 'react';
import {
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '@/lib/firebase/AuthProvider';

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  if (loading) {
    return (
      <IconButton size="large" color="inherit" disabled>
        <CircularProgress size={20} thickness={5} sx={{ color: 'text.secondary' }} />
      </IconButton>
    );
  }

  if (!user) {
    return (
      <Tooltip title="Googleでログインして既読を同期">
        <IconButton
          onClick={() => {
            void signInWithGoogle();
          }}
          size="large"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
          aria-label="Googleでログイン"
        >
          <LoginIcon />
        </IconButton>
      </Tooltip>
    );
  }

  const displayName = user.displayName ?? 'ユーザー';

  return (
    <React.Fragment>
      <Tooltip title="アカウント">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{ p: 0.5 }}
        >
          <Avatar
            src={user.photoURL ?? undefined}
            alt={displayName}
            sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          {user.email && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user.email}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 14 }} color="success" />
            <Typography variant="caption" color="success.main">
              既読を同期中
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            void signOut();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ログアウト</ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
