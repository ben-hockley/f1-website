"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/results', label: 'Results' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/constructors', label: 'Constructors' },
];

const Header = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
            F1
          </span>
          <div>
            <p className="text-2xl font-semibold uppercase leading-none tracking-[0.16em] text-white">F1 Pulse</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400 transition-colors group-hover:text-slate-200">
              Race Intelligence
            </p>
          </div>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                      active
                        ? 'bg-white text-slate-900 shadow-lg shadow-white/15'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
