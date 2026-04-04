import { DriverStanding } from '@/lib/types';
import DriverNameWithFlag from './DriverNameWithFlag';
import ConstructorNameWithLogo from './ConstructorNameWithLogo';

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable: React.FC<DriverStandingsTableProps> = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No driver standings available.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.08em] text-white">Driver Standings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/[0.04] text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Constructor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Wins</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {standings.map((standing) => (
              <tr key={standing.Driver.driverId} className="transition hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                  <span className="inline-flex min-w-8 justify-center rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold">
                    {standing.position}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-white">
                  <DriverNameWithFlag
                    givenName={standing.Driver.givenName}
                    familyName={standing.Driver.familyName}
                    nationality={standing.Driver.nationality}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
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

export default DriverStandingsTable;
