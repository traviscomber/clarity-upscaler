import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clar1ty Studio - Professional Image Upscaling',
  description: 'Upscale images with AI-powered N3uralia engine. Professional quality preservation with intelligent enhancement strategies.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#050505" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
