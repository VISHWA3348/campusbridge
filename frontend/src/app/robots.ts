import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusbridge.zinoingroup.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/auth/pending',
        '/auth/rejected',
        '/verify/',
        '/verify-email',
        '/reset-password',
        '/forgot-password'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
