import Link from 'next/link';
import { Race } from '@/lib/types';
import StatCard from './StatCard';
import DriverNameWithFlag from './DriverNameWithFlag';
import ConstructorNameWithLogo from './ConstructorNameWithLogo';
import PositionBadge from './PositionBadge';
import LocationWithFlag from './LocationWithFlag';

interface RaceResultsProps {
  race: Race | null;
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

const RaceResults: React.FC<RaceResultsProps> = ({
  race,
  season,
  round,
  totalRounds,
  previousRound,
  nextRound,
  hasPublishedResults,
}) => {
  if (!race) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No race results available.</p>;
  }

  const hasRaceTable = hasPublishedResults && race.Results.length > 0;
  const locationLocality = race.Circuit.Location.locality;
  const locationCountry = race.Circuit.Location.country;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
          {season ? `${season} Season` : 'Race Results'}
        </p>
        <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">{race.raceName}</h2>
      </div>

      {totalRounds > 0 ? (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          {previousRound ? (
            <Link
              href={`/results?round=${encodeURIComponent(previousRound)}`}
              className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
              aria-label={`View race results for round ${previousRound}`}
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
              href={`/results?round=${encodeURIComponent(nextRound)}`}
              className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
              aria-label={`View race results for round ${nextRound}`}
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
        <StatCard title="Circuit" value={valueOrFallback(race.Circuit.circuitName)} />
        <StatCard title="Date" value={valueOrFallback(race.date)} />
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

      {hasRaceTable ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.04] text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Pos</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {race.Results.map((result) => (
                <tr key={`${result.Driver.driverId}-${result.position}-${result.points}`} className="transition hover:bg-white/[0.03]">
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
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{result.Time?.time || 'N/A'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-orange-300">{valueOrFallback(result.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-t border-white/10 px-5 py-5">
          <h3 className="text-lg font-semibold uppercase tracking-[0.08em] text-white">Results Not Published Yet</h3>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Race results are not available for this round yet.
            {race.date ? ` Check back after ${race.date}.` : ''}
          </p>
        </div>
      )}
    </section>
  );
};

export default RaceResults;
