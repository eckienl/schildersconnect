import type { MetadataRoute } from 'next';
import { JOB_SLUGS, allPlaces } from '@/lib/places';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://schildersconnect-eckiemedia.vercel.app').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/klus-plaatsen', '/voor-schilders', '/opdrachten', '/schilders', '/veelgestelde-vragen', '/contact', '/voorwaarden', '/privacy'];
  const out: MetadataRoute.Sitemap = pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }));
  for (const place of allPlaces()) {
    out.push({ url: `${BASE}/schilders/${place.slug}`, changeFrequency: 'weekly', priority: 0.6 });
    for (const slug of Object.keys(JOB_SLUGS)) out.push({ url: `${BASE}/schilders/${place.slug}/${slug}`, changeFrequency: 'monthly', priority: 0.5 });
  }
  return out;
}
