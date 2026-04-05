import type { Metadata } from 'next';
import RaceResults from '@/components/RaceResults';
import WeekendSessionLinks from '@/components/WeekendSessionLinks';
import WeekendSessionResults from '@/components/WeekendSessionResults';
import {
  getCurrentSeasonRaceCalendar,
  getLatestRaceWeekendSessionResults,
  getLatestRaceResults,
  getRaceResultsByRound,
  getRaceWeekendSessionResultsByRound,
} from '@/lib/api';
import { isSprintRaceWeekendSession, normalizeRaceWeekendSession } from '@/lib/raceWeekendSessions';
import { Race, RaceWeekendSessionAvailability, RaceWeekendSessionKey, RaceWeekendSessionResponse } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Race Results',
};

interface ResultsPageProps {
  searchParams: Promise<{ round?: string | string[]; session?: string | string[] }>;
}

const DEFAULT_SESSION_AVAILABILITY: RaceWeekendSessionAvailability = {
  race: true,
  fp1: false,
  fp2: false,
  fp3: false,
  qualy: false,
  'sprint-qualy': false,
  'sprint-race': false,
};

function getSearchParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function normalizeRound(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '';
}

function toRaceDateTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = trimmed.includes('T') ? trimmed : `${trimmed}T23:59:59Z`;
  const timestamp = Date.parse(candidate);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function isFutureRaceDate(value: string): boolean {
  const timestamp = toRaceDateTimestamp(value);
  return timestamp !== null && timestamp > Date.now();
}

function createFallbackWeekendSessionData(
  session: RaceWeekendSessionKey,
  season: string,
  round: string,
  race: Race | null,
): RaceWeekendSessionResponse {
  return {
    season,
    round,
    session,
    raceName: race?.raceName ?? '',
    date: race?.date ?? '',
    Circuit: race?.Circuit ?? {
      circuitId: '',
      circuitName: '',
      Location: {
        country: '',
        locality: '',
      },
    },
    Results: [],
  };
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const { round, session } = await searchParams;
  const requestedRound = normalizeRound(getSearchParamValue(round));
  const requestedSession = normalizeRaceWeekendSession(getSearchParamValue(session));

  let race: Race | null = null;
  let fetchError = false;
  let season = '';
  let selectedRound = '';
  let totalRounds = 0;
  let previousRound = '';
  let nextRound = '';
  let selectedSession: RaceWeekendSessionKey = requestedSession;
  let weekendSessionData: RaceWeekendSessionResponse | null = null;
  let sessionAvailability: RaceWeekendSessionAvailability = DEFAULT_SESSION_AVAILABILITY;
  let hasPublishedResults = false;
  let isFutureRace = false;

  try {
    const raceCalendar = await getCurrentSeasonRaceCalendar().catch(() => null);

    season = raceCalendar?.season || '';

    const availableRounds = raceCalendar?.races.map((entry) => entry.round) ?? [];
    const hasRequestedRound = requestedRound ? availableRounds.includes(requestedRound) : false;

    selectedRound =
      (hasRequestedRound ? requestedRound : '') ||
      raceCalendar?.currentRound ||
      raceCalendar?.latestCompletedRound ||
      availableRounds[0] ||
      '';

    totalRounds = availableRounds.length;

    if (selectedRound && availableRounds.length) {
      const currentIndex = availableRounds.indexOf(selectedRound);

      if (currentIndex > 0) {
        previousRound = availableRounds[currentIndex - 1] ?? '';
      }

      if (currentIndex >= 0 && currentIndex < availableRounds.length - 1) {
        nextRound = availableRounds[currentIndex + 1] ?? '';
      }
    }

    const selectedRaceMeta = raceCalendar?.races.find((entry) => entry.round === selectedRound);
    sessionAvailability = selectedRaceMeta?.sessionAvailability ?? DEFAULT_SESSION_AVAILABILITY;
    isFutureRace = selectedRaceMeta ? isFutureRaceDate(selectedRaceMeta.date) : false;

    if (selectedSession !== 'race') {
      const hasRequestedSession = Boolean(sessionAvailability[selectedSession]);
      const hasRequestedSprintSession = isSprintRaceWeekendSession(selectedSession);

      if (!hasRequestedSession || (hasRequestedSprintSession && !selectedRaceMeta?.hasSprint)) {
        selectedSession = 'race';
      }
    }

    if (season && selectedRound && !isFutureRace) {
      const selectedRaceResults = await getRaceResultsByRound(season, selectedRound).catch(() => null);
      race = selectedRaceResults?.Race ?? null;
    }

    if (!race && !isFutureRace && (!selectedRaceMeta || selectedRaceMeta.hasResults)) {
      const latestRaceResults = await getLatestRaceResults().catch(() => null);

      if (!season) {
        season = latestRaceResults?.season || '';
      }

      if (!selectedRound) {
        selectedRound = latestRaceResults?.round || '';
      }

      if (!race && latestRaceResults?.Race && latestRaceResults.round === selectedRound) {
        race = latestRaceResults.Race;
      }
    }

    if (!race && selectedRaceMeta) {
      race = {
        raceName: selectedRaceMeta.raceName,
        date: selectedRaceMeta.date,
        Circuit: {
          circuitId: '',
          circuitName: selectedRaceMeta.circuitName,
          Location: {
            country: selectedRaceMeta.circuitCountry,
            locality: selectedRaceMeta.circuitCity,
          },
        },
        Results: [],
      };
    }

    if (!raceCalendar && !race) {
      throw new Error('Unable to load race data.');
    }

    hasPublishedResults = Boolean(selectedRaceMeta?.hasResults) || Boolean(race?.Results.length);

    if (selectedSession !== 'race' && !hasPublishedResults) {
      selectedSession = 'race';
    }

    if (selectedSession !== 'race' && season && selectedRound && !isFutureRace) {
      weekendSessionData = await getRaceWeekendSessionResultsByRound(season, selectedRound, selectedSession).catch(() => null);

      if (!weekendSessionData && hasPublishedResults) {
        const latestSessionData = await getLatestRaceWeekendSessionResults(selectedSession).catch(() => null);

        if (!season) {
          season = latestSessionData?.season || '';
        }

        if (!selectedRound) {
          selectedRound = latestSessionData?.round || '';
        }

        if (latestSessionData?.round === selectedRound) {
          weekendSessionData = latestSessionData;
        }
      }

      if (!weekendSessionData) {
        weekendSessionData = createFallbackWeekendSessionData(selectedSession, season, selectedRound, race);
      }
    }
  } catch {
    fetchError = true;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Race Center</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">Season Results</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Navigate through the season round by round to view previous, current, and upcoming race result states.
        </p>
      </section>

      {fetchError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">Error loading race results.</div>
      ) : race ? (
        <>
          <WeekendSessionLinks
            round={selectedRound}
            activeSession={selectedSession}
            sessionAvailability={sessionAvailability}
            hasPublishedResults={hasPublishedResults}
          />

          {selectedSession === 'race' ? (
            <RaceResults
              race={race}
              season={season}
              round={selectedRound}
              totalRounds={totalRounds}
              previousRound={previousRound}
              nextRound={nextRound}
              hasPublishedResults={hasPublishedResults}
            />
          ) : weekendSessionData ? (
            <WeekendSessionResults
              sessionData={weekendSessionData}
              season={season}
              round={selectedRound}
              totalRounds={totalRounds}
              previousRound={previousRound}
              nextRound={nextRound}
              hasPublishedResults={hasPublishedResults}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">
              No session data found for this round.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No race data found for this round.</div>
      )}
    </main>
  );
}
