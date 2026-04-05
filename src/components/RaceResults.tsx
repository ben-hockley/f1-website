import { Race } from '@/lib/types';
import StatCard from './StatCard';
import DriverNameWithFlag from './DriverNameWithFlag';
import ConstructorNameWithLogo from './ConstructorNameWithLogo';
import PositionBadge from './PositionBadge';
import LocationWithFlag from './LocationWithFlag';

interface RaceResultsProps {
  race: Race;
}

const RaceResults: React.FC<RaceResultsProps> = ({ race }) => {
  if (!race) {
    return <p className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No race results available.</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Last Race Results</p>
        <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em] text-white">{race.raceName}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
        <StatCard title="Circuit" value={race.Circuit.circuitName} />
        <StatCard title="Date" value={race.date} />
        <StatCard
          title="Location"
          value={<LocationWithFlag locality={race.Circuit.Location.locality} country={race.Circuit.Location.country} />}
        />
      </div>
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
              <tr key={result.Driver.driverId} className="transition hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                  <PositionBadge position={result.position} />
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
                    name={result.Constructor.name}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">{result.Time?.time || 'N/A'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-orange-300">{result.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RaceResults;
