import { ConstructorStanding } from '@/lib/types';
import ConstructorNameWithLogo from './ConstructorNameWithLogo';
import PositionBadge from './PositionBadge';

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
  compact?: boolean;
}

const ConstructorStandingsTable: React.FC<ConstructorStandingsTableProps> = ({ standings, compact = false }) => {
  if (!standings || standings.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No constructor standings available.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Constructor Standings</h2>
      </div>
      <div className={compact ? 'overflow-x-hidden' : 'overflow-x-auto'}>
        <table className={`min-w-full text-sm ${compact ? 'table-fixed' : ''}`}>
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="w-14 px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Pos</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor</th>
              {!compact ? <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Wins</th> : null}
              <th className="w-16 px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {standings.map((standing) => (
              <tr key={standing.Constructor.constructorId} className="transition hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-white">
                  <PositionBadge position={standing.position} />
                </td>
                <td className={`px-3 py-3 text-sm font-semibold text-white ${compact ? 'min-w-0' : 'whitespace-nowrap'}`}>
                  <ConstructorNameWithLogo
                    constructorId={standing.Constructor.constructorId}
                    name={standing.Constructor.name}
                    className={compact ? 'w-full' : undefined}
                    nameClassName={compact ? 'truncate' : undefined}
                  />
                </td>
                {!compact ? <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{standing.wins}</td> : null}
                <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-orange-300">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ConstructorStandingsTable;
