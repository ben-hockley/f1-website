import { getDriverStandings, getConstructorStandings, getLatestRaceResults } from '@/lib/api';
import DriverStandingsTable from '@/components/DriverStandingsTable';
import ConstructorStandingsTable from '@/components/ConstructorStandingsTable';
import RaceResults from '@/components/RaceResults';
import LoadingCard from '@/components/LoadingCard';
import { Suspense } from 'react';
import Link from 'next/link';

const quickLinks = [
  {
    href: '/results',
    title: 'Race Results',
    description: 'Full breakdown of the latest grand prix finishing order.',
  },
  {
    href: '/drivers',
    title: 'Driver Standings',
    description: 'Championship leaderboard with points and wins.',
  },
  {
    href: '/constructors',
    title: 'Constructor Standings',
    description: 'Team rankings for the current season title race.',
  },
];

export default async function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">2026 Season Hub</p>
          <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">F1 Pulse Dashboard</h1>
          <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
            Live race intelligence, driver momentum, and constructor title pressure in one sleek command center.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-orange-300/60 hover:bg-white/[0.06]"
              >
                <h2 className="text-lg font-semibold uppercase tracking-[0.08em] text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300 transition group-hover:text-orange-200">
                  Explore
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingCard message="Loading Race Results..." minHeight="min-h-[420px]" />}>
            <RaceResultsData />
          </Suspense>
        </div>
        <div className="space-y-6">
          <Suspense fallback={<LoadingCard message="Loading Driver Standings..." />}>
            <DriverStandingsData />
          </Suspense>
          <Suspense fallback={<LoadingCard message="Loading Constructor Standings..." />}>
            <ConstructorStandingsData />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

async function RaceResultsData() {
  let race = null;
  let fetchError = false;

  try {
    const raceResults = await getLatestRaceResults();
    race = raceResults.Race ?? null;
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
        Error loading race results.
      </div>
    );
  }
  if (!race) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No recent race results found.</div>
    );
  }

  return <RaceResults race={race} />;
}

async function DriverStandingsData() {
  let standings = null;
  let fetchError = false;

  try {
    const data = await getDriverStandings();
    standings = data.DriverStandings?.length ? data.DriverStandings : null;
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
        Error loading driver standings.
      </div>
    );
  }
  if (!standings) {
    return <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No driver standings found.</div>;
  }

  return <DriverStandingsTable standings={standings} compact />;
}

async function ConstructorStandingsData() {
  let standings = null;
  let fetchError = false;

  try {
    const data = await getConstructorStandings();
    standings = data.ConstructorStandings?.length ? data.ConstructorStandings : null;
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
        Error loading constructor standings.
      </div>
    );
  }
  if (!standings) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No constructor standings found.</div>
    );
  }

  return <ConstructorStandingsTable standings={standings} compact />;
}
