"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConstructorDirectoryEntry, DriverDirectoryEntry } from '@/lib/types';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/results', label: 'Results' },
];

const MAX_DROPDOWN_RESULTS = 12;

type OpenMenu = 'drivers' | 'constructors' | null;

interface HeaderProps {
  driverOptions: DriverDirectoryEntry[];
  constructorOptions: ConstructorDirectoryEntry[];
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function getDriverLabel(driver: DriverDirectoryEntry): string {
  return `${driver.givenName} ${driver.familyName}`.replace(/\s+/g, ' ').trim() || driver.driverId;
}

const Header: React.FC<HeaderProps> = ({ driverOptions, constructorOptions }) => {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const driverInputRef = useRef<HTMLInputElement | null>(null);
  const constructorInputRef = useRef<HTMLInputElement | null>(null);

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [driverQuery, setDriverQuery] = useState('');
  const [constructorQuery, setConstructorQuery] = useState('');

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  const driverMatches = useMemo(() => {
    const query = normalizeSearch(driverQuery);
    const source = query
      ? driverOptions.filter((driver) => {
          const searchText = `${driver.driverId} ${driver.givenName} ${driver.familyName} ${driver.nationality}`.toLowerCase();
          return searchText.includes(query);
        })
      : driverOptions;

    return source.slice(0, MAX_DROPDOWN_RESULTS);
  }, [driverOptions, driverQuery]);

  const constructorMatches = useMemo(() => {
    const query = normalizeSearch(constructorQuery);
    const source = query
      ? constructorOptions.filter((constructor) => {
          const searchText = `${constructor.constructorId} ${constructor.name} ${constructor.nationality}`.toLowerCase();
          return searchText.includes(query);
        })
      : constructorOptions;

    return source.slice(0, MAX_DROPDOWN_RESULTS);
  }, [constructorOptions, constructorQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (openMenu === 'drivers') {
      driverInputRef.current?.focus();
    }

    if (openMenu === 'constructors') {
      constructorInputRef.current?.focus();
    }
  }, [openMenu]);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeMenus = () => {
    setOpenMenu(null);
  };

  const driversActive = isActive('/drivers');
  const constructorsActive = isActive('/constructors');

  const navItemClass =
    'inline-flex rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition';

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
        <nav aria-label="Primary navigation" ref={navRef}>
          <ul className="flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`${navItemClass} ${
                      active
                        ? 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-orange-500/30 ring-1 ring-white/35'
                        : 'text-slate-200/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            <li className="relative">
              <div
                className={`inline-flex overflow-hidden rounded-xl transition ${
                  driversActive
                    ? 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-orange-500/30 ring-1 ring-white/35'
                    : 'text-slate-200/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Link href="/drivers" aria-current={driversActive ? 'page' : undefined} className={navItemClass}>
                  Drivers
                </Link>
                <button
                  type="button"
                  aria-expanded={openMenu === 'drivers'}
                  aria-controls="drivers-menu"
                  aria-label="Open driver selector"
                  onClick={() => toggleMenu('drivers')}
                  className={`inline-flex items-center border-l px-2 transition ${
                    driversActive
                      ? 'border-slate-900/20 text-slate-900/90'
                      : 'border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-4 w-4 transition-transform ${openMenu === 'drivers' ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {openMenu === 'drivers' ? (
                <div
                  id="drivers-menu"
                  className="absolute left-0 z-50 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl sm:left-auto sm:right-0"
                >
                  <div className="border-b border-white/10 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">Driver Directory</p>
                    <input
                      ref={driverInputRef}
                      type="text"
                      value={driverQuery}
                      onChange={(event) => setDriverQuery(event.target.value)}
                      placeholder="Search by name, id, or nationality"
                      className="mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-orange-300/70 focus:ring-2 focus:ring-orange-300/25"
                    />
                    <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-400">Showing up to 12 matches</p>
                  </div>
                  <ul className="max-h-80 space-y-1 overflow-y-auto p-2">
                    <li>
                      <Link
                        href="/drivers"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <span className="font-semibold uppercase tracking-[0.08em]">View Standings</span>
                        <span className="text-xs text-orange-300">Drivers</span>
                      </Link>
                    </li>
                    {driverMatches.length > 0 ? (
                      driverMatches.map((driver) => (
                        <li key={driver.driverId}>
                          <Link
                            href={`/drivers/${encodeURIComponent(driver.driverId)}`}
                            onClick={closeMenus}
                            className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.06]"
                          >
                            <span className="truncate text-sm font-semibold text-white group-hover:text-orange-200">
                              {getDriverLabel(driver)}
                            </span>
                            <span className="truncate text-[11px] uppercase tracking-[0.12em] text-slate-400 group-hover:text-slate-200">
                              {driver.nationality || driver.driverId}
                            </span>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-3 text-sm text-slate-300">No drivers match your search.</li>
                    )}
                  </ul>
                </div>
              ) : null}
            </li>

            <li className="relative">
              <div
                className={`inline-flex overflow-hidden rounded-xl transition ${
                  constructorsActive
                    ? 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950 shadow-lg shadow-orange-500/30 ring-1 ring-white/35'
                    : 'text-slate-200/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Link href="/constructors" aria-current={constructorsActive ? 'page' : undefined} className={navItemClass}>
                  Constructors
                </Link>
                <button
                  type="button"
                  aria-expanded={openMenu === 'constructors'}
                  aria-controls="constructors-menu"
                  aria-label="Open constructor selector"
                  onClick={() => toggleMenu('constructors')}
                  className={`inline-flex items-center border-l px-2 transition ${
                    constructorsActive
                      ? 'border-slate-900/20 text-slate-900/90'
                      : 'border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-4 w-4 transition-transform ${openMenu === 'constructors' ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {openMenu === 'constructors' ? (
                <div
                  id="constructors-menu"
                  className="absolute left-0 z-50 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl sm:left-auto sm:right-0"
                >
                  <div className="border-b border-white/10 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">Constructor Directory</p>
                    <input
                      ref={constructorInputRef}
                      type="text"
                      value={constructorQuery}
                      onChange={(event) => setConstructorQuery(event.target.value)}
                      placeholder="Search by name, id, or nationality"
                      className="mt-2 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-orange-300/70 focus:ring-2 focus:ring-orange-300/25"
                    />
                    <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-400">Showing up to 12 matches</p>
                  </div>
                  <ul className="max-h-80 space-y-1 overflow-y-auto p-2">
                    <li>
                      <Link
                        href="/constructors"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <span className="font-semibold uppercase tracking-[0.08em]">View Standings</span>
                        <span className="text-xs text-orange-300">Constructors</span>
                      </Link>
                    </li>
                    {constructorMatches.length > 0 ? (
                      constructorMatches.map((constructor) => (
                        <li key={constructor.constructorId}>
                          <Link
                            href={`/constructors/${encodeURIComponent(constructor.constructorId)}`}
                            onClick={closeMenus}
                            className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition hover:bg-white/[0.06]"
                          >
                            <span className="truncate text-sm font-semibold text-white group-hover:text-orange-200">
                              {constructor.name}
                            </span>
                            <span className="truncate text-[11px] uppercase tracking-[0.12em] text-slate-400 group-hover:text-slate-200">
                              {constructor.nationality || constructor.constructorId}
                            </span>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-3 text-sm text-slate-300">No constructors match your search.</li>
                    )}
                  </ul>
                </div>
              ) : null}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
