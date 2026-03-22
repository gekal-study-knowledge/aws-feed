'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: {
      push: () => void;
    }[];
  }
}

export default function AdUnit({ adSlot, adFormat = 'auto', style }: AdUnitProps) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push();
      }
    } catch (err) {
      console.error('AdUnit error:', err);
    }
  }, [pathname]);

  const formatStyles = {
    auto: { display: 'block' },
    fluid: { display: 'block' },
    rectangle: { display: 'inline-block', width: '300px', height: '250px' },
    horizontal: { display: 'inline-block', width: '728px', height: '90px' },
    vertical: { display: 'inline-block', width: '160px', height: '600px' },
  };

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || '';

  return (
    <div style={{ margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={{
          ...formatStyles[adFormat],
          ...style,
        }}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
