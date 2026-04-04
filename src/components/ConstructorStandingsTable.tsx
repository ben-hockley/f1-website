import { ConstructorStanding } from '@/lib/types';

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
}

const ConstructorStandingsTable: React.FC<ConstructorStandingsTableProps> = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return <p>No constructor standings available.</p>;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-white mb-4">Constructor Standings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Constructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wins</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {standings.map((standing) => (
              <tr key={standing.Constructor.constructorId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{standing.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{standing.Constructor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{standing.wins}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConstructorStandingsTable;
