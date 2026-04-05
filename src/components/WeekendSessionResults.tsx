import Link from 'next/link';
import ConstructorNameWithLogo from '@/components/ConstructorNameWithLogo';
import DriverNameWithFlag from '@/components/DriverNameWithFlag';
import LocationWithFlag from '@/components/LocationWithFlag';
import PositionBadge from '@/components/PositionBadge';
import StatCard from '@/components/StatCard';
import { RACE_WEEKEND_SESSION_LABELS } from '@/lib/raceWeekendSessions';
import { RaceWeekendSessionKey, RaceWeekendSessionResponse } from '@/lib/types';

interface WeekendSessionResultsProps {
  sessionData: RaceWeekendSessionResponse;
  season: string;
  round: string;
  totalRounds: number;
  previousRound: string;
  nextRound: string;
  hasPublishedResults: boolean;
}

function valueOrFallback(value: string): string {
  const trimmed = value.trim();
  return trimmed || 'N/A';
}

function buildRoundHref(round: string, session: RaceWeekendSessionKey): string {
  const encodedRound = encodeURIComponent(round);

  if (session === 'race') {
    return `/results?round=${encodedRound}`;
  }

  return `/results?round=${encodedRound}&session=${encodeURIComponent(session)}`;
}

const WeekendSessionResults: React.FC<WeekendSessionResultsProps> = ({
  sessionData,
  season,
  round,
  totalRounds,
  previousRound,
  nextRound,
  hasPublishedResults,
}) => {
  const sessionLabel = RACE_WEEKEND_SESSION_LABELS[sessionData.session];
  const hasSessionTable = hasPublishedResults && sessionData.Results.length > 0;
  const locationLocality = sessionData.Circuit.Location.locality;
  const locationCountry = sessionData.Circuit.Location.country;

  const isPracticeSession = sessionData.session === 'fp1' || sessionData.session === 'fp2' || sessionData.session === 'fp3';
  const isQualifyingSession = sessionData.session === 'qualy' || sessionData.session === 'sprint-qualy';
  const isSprintRaceSession = sessionData.session === 'sprint-race';

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
          {season ? `${season} Season` : 'Weekend Session'}
        </p>
        <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">{sessionData.raceName}</h2>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">{sessionLabel} Results</p>
      </div>

      {totalRounds > 0 ? (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          {previousRound ? (
            <Link
              href={buildRoundHref(previousRound, sessionData.session)}
              className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
              aria-label={`View ${sessionLabel.toLowerCase()} results for round ${previousRound}`}
            >
              ← Previous
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              ← Previous
            </span>
          )}

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
            {round ? `Round ${round}` : 'Round N/A'}
            {totalRounds ? ` / ${totalRounds}` : ''}
          </p>

          {nextRound ? (
            <Link
              href={buildRoundHref(nextRound, sessionData.session)}
              className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
              aria-label={`View ${sessionLabel.toLowerCase()} results for round ${nextRound}`}
            >
              Next →
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Next →
            </span>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <StatCard title="Circuit" value={valueOrFallback(sessionData.Circuit.circuitName)} />
        <StatCard title="Date" value={valueOrFallback(sessionData.date)} />
        <StatCard
          title="Location"
          value={
            locationLocality || locationCountry ? (
              <LocationWithFlag locality={locationLocality} country={locationCountry} />
            ) : (
              'N/A'
            )
          }
        />
      </div>

      {hasSessionTable ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.04] text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Pos</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor</th>
                {isPracticeSession ? (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Time</th>
                ) : null}
                {isQualifyingSession ? (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">
                      {sessionData.session === 'sprint-qualy' ? 'SQ1' : 'Q1'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">
                      {sessionData.session === 'sprint-qualy' ? 'SQ2' : 'Q2'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">
                      {sessionData.session === 'sprint-qualy' ? 'SQ3' : 'Q3'}
                    </th>
                  </>
                ) : null}
                {isSprintRaceSession ? (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Grid</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {sessionData.Results.map((result) => (
                <tr
                  key={`${sessionData.session}-${result.Driver.driverId}-${result.position}-${result.points}`}
                  className="transition hover:bg-white/[0.03]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                    {result.position ? <PositionBadge position={result.position} /> : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">
                    <DriverNameWithFlag
                      driverId={result.Driver.driverId}
                      givenName={result.Driver.givenName}
                      familyName={result.Driver.familyName}
                      nationality={result.Driver.nationality}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                    <ConstructorNameWithLogo
                      constructorId={result.Constructor.constructorId}
                      name={valueOrFallback(result.Constructor.name)}
                    />
                  </td>
                  {isPracticeSession ? (
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.time)}</td>
                  ) : null}
                  {isQualifyingSession ? (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.q1)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.q2)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.q3)}</td>
                    </>
                  ) : null}
                  {isSprintRaceSession ? (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{valueOrFallback(result.grid)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-orange-300">
                        {valueOrFallback(result.points)}
                      </td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-t border-white/10 px-5 py-5">
          <h3 className="text-lg font-semibold uppercase tracking-[0.08em] text-white">Results Not Published Yet</h3>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            {sessionLabel} results are not available for this round yet.
            {sessionData.date ? ` Check back after ${sessionData.date}.` : ''}
          </p>
        </div>
      )}
    </section>
  );
};

export default WeekendSessionResults;
