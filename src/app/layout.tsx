import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Наши Сериалы | Брутальный Трекер',
  description: 'Отслеживаем сериалы вместе',
  manifest: '/manifest.json',
  icons: {
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Наши Сериалы',
    description: 'Брутальный трекер для двоих',
    type: 'website',
  },
  themeColor: '#3b82f6',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang='ru'>
      <link href='/manifest.json' rel='manifest' />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
