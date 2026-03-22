'use client';

import Script from 'next/script';

interface GoogleAdSenseProps {
  adsenseId: string;
}

export default function GoogleAdSense({ adsenseId }: GoogleAdSenseProps) {
  if (!adsenseId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
