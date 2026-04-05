import Link from 'next/link';
import { ConstructorHistoricalSeasonRow } from '@/lib/types';
import DriverNameWithFlag from './DriverNameWithFlag';
import PositionBadge from './PositionBadge';

type HistoryMode = 'recent' | 'full';

interface ConstructorHistoricalResultsProps {
  seasons: ConstructorHistoricalSeasonRow[];
  previousConstructorNames: string[];
  historyMode: HistoryMode;
  toggleHref: string;
}

function valueOrFallback(value: string): string {
  const trimmed = value.trim();
  return trimmed || 'N/A';
}

const ConstructorHistoricalResults: React.FC<ConstructorHistoricalResultsProps> = ({
  seasons,
  previousConstructorNames,
  historyMode,
  toggleHref,
}) => {
  if (!seasons.length) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No historical constructor results available.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Historical Constructor Results</h2>
        <Link
          href={toggleHref}
          className="inline-flex rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-200 transition hover:border-orange-300/60 hover:text-white"
        >
          {historyMode === 'recent' ? 'Show Full History' : 'Show Recent Seasons'}
        </Link>
      </div>

      {historyMode === 'recent' ? (
        <p className="border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.12em] text-slate-400">
          Showing recent seasons for faster loading.
        </p>
      ) : null}

      {historyMode === 'full' && previousConstructorNames.length ? (
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Previous Constructor Names</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {previousConstructorNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Season</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Position</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Wins</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Drivers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {seasons.map((season) => (
              <tr key={`${season.season}-${season.constructorId}`} className="align-top transition hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">{valueOrFallback(season.season)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-100">{valueOrFallback(season.constructorName)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                  {season.position ? <PositionBadge position={season.position} /> : <span className="text-slate-400">N/A</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-300">{valueOrFallback(season.wins)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-orange-300">{valueOrFallback(season.points)}</td>
                <td className="min-w-[16rem] px-4 py-3 text-sm text-slate-200">
                  {season.drivers.length ? (
                    <div className="space-y-1.5">
                      {season.drivers.map((driver) => (
                        <div key={driver.driverId || `${driver.givenName}-${driver.familyName}`} className="flex items-center justify-between gap-3">
                          <DriverNameWithFlag
                            driverId={driver.driverId}
                            givenName={driver.givenName}
                            familyName={driver.familyName}
                            nationality={driver.nationality}
                            className="min-w-0"
                            nameClassName="truncate"
                          />
                          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                            {valueOrFallback(driver.points)} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">No driver roster published</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ConstructorHistoricalResults;
