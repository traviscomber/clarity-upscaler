'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const navItems = [
    { href: '/studio', label: 'Studio' },
    { href: '/models', label: 'Models' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-[#3a3530] bg-[#1f1a16] backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Branding */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#d4a574] flex items-center justify-center group-hover:shadow-lg transition-all">
            <span className="text-[#1a1410] font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-[#ffffff]">Clar1ty</span>
        </Link>

        {/* Navigation */}
        <nav className="flex gap-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`
                px-4 py-2 rounded-md transition-all relative
                ${
                  isActive(href)
                    ? 'text-[#d4a574] bg-[#2d2620]'
                    : 'text-[#e8e4dd] hover:text-[#d4a574]'
                }
              `}
            >
              {label}
              {isActive(href) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a574]"
                  initial={false}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          href="/studio"
          className="
            px-5 py-2 rounded-lg bg-[#d4a574] text-[#1a1410] font-semibold
            hover:bg-[#e8d9c7] transition-colors text-sm
            active:scale-95 transform
          "
        >
          Studio
        </Link>
      </div>
    </motion.header>
  );
}
