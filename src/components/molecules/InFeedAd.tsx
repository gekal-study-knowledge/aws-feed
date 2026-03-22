'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function InFeedAd() {
  const pathname = usePathname();
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || '';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (err) {
      console.error('InFeedAd error:', err);
    }
  }, [pathname]);

  if (!adsenseId) {
    return null;
  }

  // モバイルでは非表示、デスクトップのみ表示
  return (
    <Box
      sx={{
        my: 4,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        minHeight: adSlot ? '250px' : '80px',
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {adSlot ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseId}
          data-ad-slot={adSlot}
          data-ad-format="vertical"
          data-full-width-responsive="false"
        />
      ) : (
        <Typography variant="caption" color="text.secondary">
          広告
        </Typography>
      )}
    </Box>
  );
}
