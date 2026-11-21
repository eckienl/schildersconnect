import type { MetadataRoute } from 'next';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://schildersconnect-eckiemedia.vercel.app').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/account', '/schilder/', '/admin', '/demo', '/factuur', '/api', '/inloggen', '/registreren'] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
