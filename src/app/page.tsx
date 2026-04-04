import { getDriverStandings, getConstructorStandings, getLatestRaceResults } from '@/lib/api';
import DriverStandingsTable from '@/components/DriverStandingsTable';
import ConstructorStandingsTable from '@/components/ConstructorStandingsTable';
import RaceResults from '@/components/RaceResults';
import LoadingCard from '@/components/LoadingCard';
import { Suspense } from 'react';

export default async function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingCard message="Loading Race Results..." minHeight="min-h-[400px]" />}>
            <RaceResultsData />
          </Suspense>
        </div>
        <div className="space-y-8">
          <Suspense fallback={<LoadingCard message="Loading Driver Standings..." />}>
            <DriverStandingsData />
          </Suspense>
          <Suspense fallback={<LoadingCard message="Loading Constructor Standings..." />}>
            <ConstructorStandingsData />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function RaceResultsData() {
  let race = null;
  let fetchError = false;

  try {
    const raceResults = await getLatestRaceResults();
    race = raceResults.Race ?? null;
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return <div className="bg-gray-800 rounded-lg shadow-md p-4 text-red-500">Error loading race results.</div>;
  }
  if (!race) {
    return <div className="bg-gray-800 rounded-lg shadow-md p-4 text-white">No recent race results found.</div>;
  }
  return <RaceResults race={race} />;
}

async function DriverStandingsData() {
  let standings = null;
  let fetchError = false;

  try {
    const data = await getDriverStandings();
    standings = data.DriverStandings?.length ? data.DriverStandings : null;
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return <div className="bg-gray-800 rounded-lg shadow-md p-4 text-red-500">Error loading driver standings.</div>;
  }
  if (!standings) {
    return <div className="bg-gray-800 rounded-lg shadow-md p-4 text-white">No driver standings found.</div>;
  }
  return <DriverStandingsTable standings={standings} />;
}

async function ConstructorStandingsData() {
  let standings = null;
  let fetchError = false;

  try {
    const data = await getConstructorStandings();
    standings = data.ConstructorStandings?.length ? data.ConstructorStandings : null;
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return <div className="bg-gray-800 rounded-lg shadow-md p-4 text-red-500">Error loading constructor standings.</div>;
  }
  if (!standings) {
    return <div className="bg-gray-800 rounded-lg shadow-md p-4 text-white">No constructor standings found.</div>;
  }
  return <ConstructorStandingsTable standings={standings} />;
}
