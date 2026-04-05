import { DriverHistoricalSeasonRow } from '@/lib/types';
import ConstructorNameWithLogo from './ConstructorNameWithLogo';
import PositionBadge from './PositionBadge';

interface DriverHistoricalTableProps {
  seasons: DriverHistoricalSeasonRow[];
}

function valueOrFallback(value: string): string {
  const trimmed = value.trim();
  return trimmed || 'N/A';
}

const DriverHistoricalTable: React.FC<DriverHistoricalTableProps> = ({ seasons }) => {
  if (!seasons.length) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No historical season results available.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Historical Season Results</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Season</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Position</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Wins</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {seasons.map((season) => (
              <tr key={`${season.season}-${season.constructor.constructorId}-${season.position}`} className="transition hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">{valueOrFallback(season.season)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-100">
                  {season.constructor.constructorId || season.constructor.name ? (
                    <ConstructorNameWithLogo constructorId={season.constructor.constructorId} name={valueOrFallback(season.constructor.name)} />
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                  {season.position ? <PositionBadge position={season.position} /> : <span className="text-slate-400">N/A</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-300">{valueOrFallback(season.wins)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-orange-300">{valueOrFallback(season.points)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DriverHistoricalTable;
