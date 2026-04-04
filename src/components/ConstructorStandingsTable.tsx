import { ConstructorStanding } from '@/lib/types';
import ConstructorNameWithLogo from './ConstructorNameWithLogo';

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
}

const ConstructorStandingsTable: React.FC<ConstructorStandingsTableProps> = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No constructor standings available.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Constructor Standings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Wins</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {standings.map((standing) => (
              <tr key={standing.Constructor.constructorId} className="transition hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                  <span className="inline-flex min-w-8 justify-center rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold">
                    {standing.position}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">
                  <ConstructorNameWithLogo
                    constructorId={standing.Constructor.constructorId}
                    name={standing.Constructor.name}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{standing.wins}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-orange-300">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ConstructorStandingsTable;
