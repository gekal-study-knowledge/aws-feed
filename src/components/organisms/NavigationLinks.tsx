import * as React from 'react';
import { Box, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';
import NavButton from '@/components/atoms/NavButton';

interface NavigationLinksProps {
  previous?: string | null;
  next?: string | null;
}

export default function NavigationLinks({ previous, next }: NavigationLinksProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 4,
        pt: 2,
        borderTop: '1px solid #eee',
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <NavButton href={previous} direction="prev" />
      </Box>

      <Box sx={{ flex: '0 0 auto' }}>
        <Link href="/" passHref>
          <Button
            component="span"
            startIcon={<HomeIcon />}
            variant="outlined"
            size="large"
            sx={{ mx: 1, fontWeight: 600 }}
          >
            Archive
          </Button>
        </Link>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <NavButton href={next} direction="next" />
      </Box>
    </Box>
  );
}
