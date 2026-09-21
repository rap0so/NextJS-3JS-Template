import { Geist, Geist_Mono } from 'next/font/google';

import TheatreStudioProvider from '@/components/theatre/theatre-studio-provider';

import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Volvo',
    template: '%s | Volvo',
  },
  description: 'Next.js + TypeScript + GSAP + Theatre.js, ready for Contentful.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

const isDevelopment = process.env.NODE_ENV !== 'production';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        {isDevelopment ? <TheatreStudioProvider /> : null}
      </body>
    </html>
  );
}
