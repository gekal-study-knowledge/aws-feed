import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    // 型検査は TS6 の JS API を使う。tsc は TS7（@typescript/native）側にあり
    // Next からは CLI として見つからないため、TypeScript CLI 経由の検査を切る
    useTypeScriptCli: false,
  },
};

export default nextConfig;
