'use client';

import * as React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Slide, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';
import ThemeSwitcher from '@/components/atoms/ThemeSwitcher';
import AuthButton from '@/components/atoms/AuthButton';

interface StickyHeaderProps {
  show: boolean;
  date: string;
}

export default function StickyHeader({ show, date }: StickyHeaderProps) {
  return (
    <Slide appear={false} direction="down" in={show}>
      <AppBar position="fixed" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar variant="dense" sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/" passHref>
            <IconButton
              component="span"
              size="medium"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <HomeIcon fontSize="medium" />
            </IconButton>
          </Link>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {date}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AuthButton />
            <ThemeSwitcher />
          </Box>
        </Toolbar>
      </AppBar>
    </Slide>
  );
}
