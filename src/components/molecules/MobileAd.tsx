'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';

interface MobileAdProps {
  position?: 'top' | 'bottom' | 'middle';
}

export default function MobileAd({ position = 'bottom' }: MobileAdProps) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE || '';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (err) {
      console.error('MobileAd error:', err);
    }
  }, []);

  if (!adsenseId) {
    return null;
  }

  const marginStyles = {
    top: { mt: 2, mb: 3 },
    middle: { my: 4 },
    bottom: { mt: 4, mb: 2 },
  };

  // モバイルのみ表示、デスクトップでは非表示
  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        ...marginStyles[position],
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        textAlign: 'center',
      }}
    >
      {adSlot ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={adsenseId}
          data-ad-slot={adSlot}
          data-ad-format="fluid"
          data-ad-layout-key="-fb+5w+4e-db+86"
          data-full-width-responsive="true"
        />
      ) : (
        <Box sx={{ minHeight: '50px' }} />
      )}
    </Box>
  );
}
