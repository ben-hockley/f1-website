import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ConstructorNameWithLogo from '@/components/ConstructorNameWithLogo';
import DriverNameWithFlag from '@/components/DriverNameWithFlag';
import PositionBadge from '@/components/PositionBadge';
import {
  getDriverCurrentSeason,
  getDriverProfile,
  getDriverStandings,
} from '@/lib/api';

interface DriverDetailPageProps {
  params: Promise<{ driverId: string }>;
}

const getDriverProfileCached = cache(async (driverId: string) => getDriverProfile(driverId));

function formatDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'N/A';
  }

  const normalized = trimmed.includes('/') ? trimmed.split('/').reverse().join('-') : trimmed;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function valueOrFallback(value: string): string {
  const trimmed = value.trim();
  return trimmed || 'N/A';
}

export async function generateMetadata({ params }: DriverDetailPageProps): Promise<Metadata> {
  const { driverId } = await params;
  const profile = await getDriverProfileCached(driverId);

  if (!profile) {
    return {
      title: 'Driver Not Found',
      description: 'Requested F1 driver could not be found.',
    };
  }

  const name = `${profile.givenName} ${profile.familyName}`.replace(/\s+/g, ' ').trim() || profile.driverId;

  return {
    title: name,
    description: `${name} profile with biography fields and season race-by-race performance.`,
  };
}

export default async function DriverDetailPage({ params }: DriverDetailPageProps) {
  const { driverId } = await params;
  const profile = await getDriverProfileCached(driverId);

  if (!profile) {
    notFound();
  }

  const [currentSeason, standings] = await Promise.all([
    getDriverCurrentSeason(profile.driverId),
    getDriverStandings().catch(() => null),
  ]);

  const currentStanding = standings?.DriverStandings.find(
    (entry) => entry.Driver.driverId.toLowerCase() === profile.driverId.toLowerCase(),
  );

  const displayName = `${profile.givenName} ${profile.familyName}`.replace(/\s+/g, ' ').trim() || profile.driverId;

  const seasonPosition = currentStanding?.position ?? '';
  const seasonPoints = currentStanding?.points ?? currentSeason?.summary.points ?? '';
  const seasonWins = currentStanding?.wins ?? currentSeason?.summary.wins ?? '';

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <div className="absolute -left-14 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-16 -top-10 h-52 w-52 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Driver Profile</p>
          <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">{displayName}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-200">
            <div className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2">
              <DriverNameWithFlag
                givenName={profile.givenName}
                familyName={profile.familyName}
                nationality={profile.nationality}
                className="gap-2"
                nameClassName="font-semibold"
              />
            </div>
            {profile.code ? (
              <span className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
                {profile.code}
              </span>
            ) : null}
            {profile.permanentNumber ? (
              <span className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
                #{profile.permanentNumber}
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/drivers"
              className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
            >
              Back To Standings
            </Link>
            {profile.url ? (
              <a
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
              >
                Biography Source
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Nationality</p>
          <p className="mt-2 text-xl font-semibold text-white">{valueOrFallback(profile.nationality)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Date Of Birth</p>
          <p className="mt-2 text-xl font-semibold text-white">{formatDate(profile.dateOfBirth)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Driver Number</p>
          <p className="mt-2 text-xl font-semibold text-white">{valueOrFallback(profile.permanentNumber)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Driver Id</p>
          <p className="mt-2 text-xl font-semibold text-white">{profile.driverId}</p>
        </div>
      </section>

      {currentSeason ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">{currentSeason.season || 'Current'} Season</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">Championship Snapshot</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Position</p>
              <div className="mt-2">
                {seasonPosition ? <PositionBadge position={seasonPosition} /> : <p className="text-lg font-semibold text-slate-200">N/A</p>}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Points</p>
              <p className="mt-2 text-2xl font-semibold text-orange-300">{valueOrFallback(seasonPoints)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Wins</p>
              <p className="mt-2 text-2xl font-semibold text-white">{valueOrFallback(seasonWins)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Podiums</p>
              <p className="mt-2 text-2xl font-semibold text-white">{valueOrFallback(currentSeason.summary.podiums)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Best Finish</p>
              <p className="mt-2 text-2xl font-semibold text-white">{valueOrFallback(currentSeason.summary.bestFinish)}</p>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Current Constructor</p>
            {currentSeason.team.constructorId ? (
              <div className="mt-3 text-sm text-slate-100">
                <ConstructorNameWithLogo constructorId={currentSeason.team.constructorId} name={currentSeason.team.name} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-300">No active constructor data is available.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-slate-200">
          <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-white">Historical Archive Profile</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Current-season race data is unavailable for this driver in the API, so this page focuses on all-time profile details.
          </p>
        </section>
      )}

      {currentSeason?.results.length ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Race By Race Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Round</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Grand Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Circuit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Finish</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Grid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Race Time</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Pts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Sprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {currentSeason.results.map((result) => (
                  <tr key={`${result.round}-${result.raceName}`} className="transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">{valueOrFallback(result.round)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">{valueOrFallback(result.raceName)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                      {valueOrFallback(result.circuitName)}
                      {result.circuitCity || result.circuitCountry ? (
                        <span className="ml-1 text-xs text-slate-400">
                          ({[result.circuitCity, result.circuitCountry].filter(Boolean).join(', ')})
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                      {result.finishingPosition ? <PositionBadge position={result.finishingPosition} /> : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.gridPosition)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.raceTime)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-orange-300">
                      {valueOrFallback(result.points)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                      {result.sprintFinishingPosition ? (
                        <span>
                          {result.sprintFinishingPosition}
                          {result.sprintPoints ? ` (${result.sprintPoints} pts)` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500">No Sprint</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : currentSeason ? (
        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-slate-200">
          <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-white">No Race Results Published</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Current-season driver details exist, but no race-by-race results were returned by the API yet.
          </p>
        </section>
      ) : null}
    </main>
  );
}
