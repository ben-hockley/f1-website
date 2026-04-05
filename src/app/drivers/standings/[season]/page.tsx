import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DriverStandingsTable from '@/components/DriverStandingsTable';
import { getDriverStandings } from '@/lib/api';

interface DriverSeasonStandingsPageProps {
  params: Promise<{ season: string }>;
}

const DRIVER_CHAMPIONSHIP_START_YEAR = 1950;
const SEASON_PARAM_PATTERN = /^\d{4}$/;

function parseSeasonParam(value: string): number | null {
  const normalized = value.trim();

  if (!SEASON_PARAM_PATTERN.test(normalized)) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toSeasonHref(season: number): string {
  return `/drivers/standings/${season}`;
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 4.5L7 10l5.5 5.5' : 'M7.5 4.5L13 10l-5.5 5.5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function generateMetadata({ params }: DriverSeasonStandingsPageProps): Promise<Metadata> {
  const { season } = await params;
  const parsedSeason = parseSeasonParam(season);

  return {
    title: parsedSeason ? `Driver Standings ${parsedSeason}` : 'Driver Standings',
  };
}

export default async function DriverSeasonStandingsPage({ params }: DriverSeasonStandingsPageProps) {
  const { season } = await params;
  const parsedSeason = parseSeasonParam(season);

  if (!parsedSeason || parsedSeason < DRIVER_CHAMPIONSHIP_START_YEAR) {
    notFound();
  }

  const [seasonData, currentData] = await Promise.all([
    getDriverStandings(String(parsedSeason)).catch(() => null),
    getDriverStandings().catch(() => null),
  ]);

  const standings = seasonData?.DriverStandings?.length ? seasonData.DriverStandings : null;
  const fetchError = !seasonData;

  const seasonFromData = Number.parseInt(seasonData?.season ?? '', 10);
  const activeSeason = Number.isFinite(seasonFromData) ? seasonFromData : parsedSeason;

  const currentSeasonFromData = Number.parseInt(currentData?.season ?? '', 10);
  const maxSeason = Number.isFinite(currentSeasonFromData) ? currentSeasonFromData : new Date().getUTCFullYear();

  const previousSeasonHref = activeSeason > DRIVER_CHAMPIONSHIP_START_YEAR ? toSeasonHref(activeSeason - 1) : null;
  const nextSeasonHref = activeSeason < maxSeason ? toSeasonHref(activeSeason + 1) : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Driver Championship</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">Driver Standings</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Live points table showing who is leading the charge for the world title.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-2 py-2">
          {previousSeasonHref ? (
            <Link
              href={previousSeasonHref}
              aria-label={`View ${activeSeason - 1} driver standings`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-slate-200 transition hover:border-orange-300/60 hover:text-white"
            >
              <ArrowIcon direction="left" />
            </Link>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500">
              <ArrowIcon direction="left" />
            </span>
          )}

          <p className="w-24 text-center text-lg font-semibold tracking-[0.12em] text-white">{activeSeason}</p>

          {nextSeasonHref ? (
            <Link
              href={nextSeasonHref}
              aria-label={`View ${activeSeason + 1} driver standings`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-slate-200 transition hover:border-orange-300/60 hover:text-white"
            >
              <ArrowIcon direction="right" />
            </Link>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500">
              <ArrowIcon direction="right" />
            </span>
          )}
        </div>
      </section>

      {fetchError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">Error loading driver standings.</div>
      ) : standings ? (
        <DriverStandingsTable standings={standings} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">
          No driver standings found for {activeSeason}.
        </div>
      )}
    </main>
  );
}
