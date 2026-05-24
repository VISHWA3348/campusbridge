import { Metadata } from 'next';
import CookiesPolicyContent from './cookies-content';

export const metadata: Metadata = {
  title: 'Cookies Policy',
  description: 'Learn how CampusBridge uses cookies to deliver a premium, secure, and personalized career networking experience.',
  keywords: [
    'Cookies Policy',
    'CampusBridge Cookies',
    'data privacy',
    'essential cookies',
    'analytics cookies',
    'authentication cookies'
  ]
};

export default function CookiesPolicyPage() {
  return <CookiesPolicyContent />;
}
