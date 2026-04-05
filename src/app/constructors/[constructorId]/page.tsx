import { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ConstructorCarModelViewerLazy from '@/components/ConstructorCarModelViewerLazy';
import ConstructorHistoricalResults from '@/components/ConstructorHistoricalResults';
import DriverNameWithFlag from '@/components/DriverNameWithFlag';
import PositionBadge from '@/components/PositionBadge';
import {
  getConstructorCurrentDrivers,
  getConstructorHistoricalResults,
  getConstructorCurrentSeason,
  getConstructorProfile,
} from '@/lib/api';
import { hasConstructorCarModel } from '@/lib/constructorCarModels';
import { getConstructorLogoPath } from '@/lib/constructorLogos';

interface ConstructorDetailPageProps {
  params: Promise<{ constructorId: string }>;
  searchParams: Promise<{ history?: string | string[] }>;
}

interface ConstructorDetailMetadataProps {
  params: Promise<{ constructorId: string }>;
}

type HistoryMode = 'recent' | 'full';

const RECENT_HISTORY_SEASONS = 12;

const getConstructorProfileCached = cache(async (constructorId: string) => getConstructorProfile(constructorId));

function valueOrFallback(value: string): string {
  const trimmed = value.trim();
  return trimmed || 'N/A';
}

function getSearchParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getHistoryMode(value: string): HistoryMode {
  return value.trim().toLowerCase() === 'full' ? 'full' : 'recent';
}

export async function generateMetadata({ params }: ConstructorDetailMetadataProps): Promise<Metadata> {
  const { constructorId } = await params;
  const profile = await getConstructorProfileCached(constructorId);

  if (!profile) {
    return {
      title: 'Constructor Not Found',
      description: 'Requested F1 constructor could not be found.',
    };
  }

  return {
    title: profile.name || profile.constructorId,
    description: `${profile.name || profile.constructorId} profile with constructor stats and current lineup data.`,
  };
}

export default async function ConstructorDetailPage({ params, searchParams }: ConstructorDetailPageProps) {
  const { constructorId } = await params;
  const { history } = await searchParams;
  const historyMode = getHistoryMode(getSearchParamValue(history));
  const profile = await getConstructorProfileCached(constructorId);

  if (!profile) {
    notFound();
  }

  const historicalOptions = historyMode === 'recent' ? { maxSeasons: RECENT_HISTORY_SEASONS } : undefined;

  const [currentSeason, currentLineup, historicalResults] = await Promise.all([
    getConstructorCurrentSeason(profile.constructorId),
    getConstructorCurrentDrivers(profile.constructorId),
    getConstructorHistoricalResults(profile.constructorId, profile.name, historicalOptions).catch(() => ({
      constructorId: profile.constructorId,
      lineageConstructorIds: [],
      seasons: [],
      previousConstructorNames: [],
    })),
  ]);

  const seasonPosition = currentLineup?.position ?? currentSeason?.position ?? '';
  const seasonPoints = currentLineup?.points ?? currentSeason?.points ?? '';
  const seasonWins = currentLineup?.wins || currentSeason?.wins || (seasonPosition || seasonPoints ? '0' : '');
  const logoPath = getConstructorLogoPath(profile.constructorId);
  const historyToggleHref =
    historyMode === 'recent'
      ? `/constructors/${encodeURIComponent(profile.constructorId)}?history=full`
      : `/constructors/${encodeURIComponent(profile.constructorId)}`;
  const hasConstructorModel = hasConstructorCarModel(profile.constructorId);

  const constructorProfileOverview = (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
      <div className="absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

      {hasConstructorModel ? (
        <div className="relative mt-6 h-[260px] w-full sm:h-[320px] lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:h-full lg:w-[54%]">
          <ConstructorCarModelViewerLazy
            constructorId={profile.constructorId}
            constructorName={profile.name}
            className="h-full w-full bg-transparent"
          />
        </div>
      ) : null}

      <div className={`relative ${hasConstructorModel ? 'lg:max-w-[46%]' : ''}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Constructor Profile</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-3">
            <Image src={logoPath} alt={`${profile.name} logo`} width={72} height={40} className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">{profile.name}</h1>
        </div>

        <p className="mt-4 text-sm text-slate-300 sm:text-base">
          Team identity, title pedigree, and live championship context in one overview.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/constructors"
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
              Team Source
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      {constructorProfileOverview}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Nationality</p>
          <p className="mt-2 text-xl font-semibold text-white">{valueOrFallback(profile.nationality)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">First Appearance</p>
          <p className="mt-2 text-xl font-semibold text-white">{valueOrFallback(profile.firstAppearance)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Constructors Titles</p>
          <p className="mt-2 text-xl font-semibold text-white">{valueOrFallback(profile.constructorsChampionships)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Drivers Titles</p>
          <p className="mt-2 text-xl font-semibold text-white">{valueOrFallback(profile.driversChampionships)}</p>
        </div>
      </section>

      {currentSeason || currentLineup ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              {currentSeason?.season || currentLineup?.season || 'Current'} Season
            </p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">Championship Snapshot</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
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
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-slate-200">
          <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-white">Historical Archive Profile</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            This constructor does not currently have live-season stats in the API, so only long-term profile details are shown.
          </p>
        </section>
      )}

      {currentLineup?.drivers.length ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Current Driver Lineup</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Position</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Wins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {currentLineup.drivers.map((driver) => (
                  <tr key={driver.driverId} className="transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">
                      <DriverNameWithFlag
                        driverId={driver.driverId}
                        givenName={driver.givenName}
                        familyName={driver.familyName}
                        nationality={driver.nationality}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(driver.code)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                      {driver.position ? <PositionBadge position={driver.position} /> : <span className="text-slate-300">N/A</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-orange-300">
                      {valueOrFallback(driver.points)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-300">{valueOrFallback(driver.wins)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : currentSeason ? (
        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-slate-200">
          <h2 className="text-xl font-semibold uppercase tracking-[0.08em] text-white">Lineup Not Available Yet</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Current team data exists, but the API has not published lineup stats for this constructor yet.
          </p>
        </section>
      ) : null}

      <section className="mt-8">
        <ConstructorHistoricalResults
          seasons={historicalResults.seasons}
          previousConstructorNames={historicalResults.previousConstructorNames}
          historyMode={historyMode}
          toggleHref={historyToggleHref}
        />
      </section>
    </main>
  );
}
