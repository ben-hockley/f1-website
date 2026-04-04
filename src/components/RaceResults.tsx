import { Race } from '@/lib/types';
import StatCard from './StatCard';

interface RaceResultsProps {
  race: Race;
}

const RaceResults: React.FC<RaceResultsProps> = ({ race }) => {
  if (!race) {
    return <p>No race results available.</p>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-white mb-4">
        Last Race Results: {race.raceName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard title="Circuit" value={race.Circuit.circuitName} />
        <StatCard title="Date" value={race.date} />
        <StatCard title="Location" value={`${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Constructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {race.Results.map((result) => (
              <tr key={result.Driver.driverId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{result.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {result.Driver.givenName} {result.Driver.familyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{result.Constructor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{result.Time?.time || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">{result.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RaceResults;
