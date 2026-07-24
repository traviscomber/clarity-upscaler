'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1f1a16] border-t border-[#3a3530] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#d4a574] flex items-center justify-center">
                <span className="text-[#1a1410] font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-[#ffffff]">Clar1ty</span>
            </div>
            <p className="text-[#8b8278] text-sm">
              Professional image upscaling powered by N3uralia engine.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-[#ffffff] font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/studio"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/models"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Models
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[#ffffff] font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.clar1ty.art"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Official Site
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/traviscomber/clarity-upscaler"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[#ffffff] font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
                >
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#3a3530] pt-8">
          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-[#8b8278] text-sm">
              &copy; {currentYear} Clar1ty. All rights reserved. Powered by N3uralia.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
              >
                Twitter
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
              >
                GitHub
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b8278] hover:text-[#d4a574] transition-colors text-sm"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
