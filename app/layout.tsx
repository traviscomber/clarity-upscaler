import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Clar1ty Studio - Professional Image Upscaling',
  description: 'Upscale images with AI-powered N3uralia engine. Professional quality preservation with intelligent enhancement strategies.',
  openGraph: {
    title: 'Clar1ty Studio',
    description: 'Professional image upscaling with N3uralia engine',
    images: [
      {
        url: 'https://www.clar1ty.art/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a1410',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-[#1a1410] text-[#e8e4dd]">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
