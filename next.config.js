/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // basePath: '/developersio-feed', // GitHub Pagesのリポジトリ名に合わせて調整。カスタムドメイン（CNAME）がある場合は不要。
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
