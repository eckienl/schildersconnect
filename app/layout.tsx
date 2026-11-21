import type { Metadata } from 'next';
import './globals.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SetupNotice } from './components/SetupNotice';
import { DemoBar } from './components/DemoBar';
import { isConfigured } from '@/lib/env';
import { DEMO_ENABLED } from '@/lib/demo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SchildersConnect – vind de juiste schilder voor jouw schilderwerk',
  description:
    'Plaats gratis je schilderklus en ontvang reacties van gescreende schilders uit jouw regio. Je kiest zelf met wie je in contact komt.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={DEMO_ENABLED && isConfigured ? 'has-demo' : undefined}>
        <Header />
        {!isConfigured && <SetupNotice />}
        <main>{children}</main>
        <Footer />
        {isConfigured && <DemoBar />}
      </body>
    </html>
  );
}
