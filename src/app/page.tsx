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
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
  let season = '';
  let round = '';
  let hasPublishedResults = false;
  let fetchError = false;

  try {
    const raceResults = await getLatestRaceResults();
    race = raceResults.Race ?? null;
    season = raceResults.season ?? '';
    round = raceResults.round ?? '';
    hasPublishedResults = Boolean(raceResults.Race?.Results?.length);
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

  return (
    <RaceResults
      race={race}
      season={season}
      round={round}
      totalRounds={0}
      previousRound=""
      nextRound=""
      hasPublishedResults={hasPublishedResults}
    />
  );
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
