import type { Metadata } from 'next';
import DriverStandingsTable from '@/components/DriverStandingsTable';
import { getDriverStandings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Driver Standings',
};

export default async function DriversPage() {
  let standings = null;
  let fetchError = false;

  try {
    const data = await getDriverStandings();
    standings = data.DriverStandings?.length ? data.DriverStandings : null;
  } catch {
    fetchError = true;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Driver Championship</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">Driver Standings</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Live points table showing who is leading the charge for the world title.
        </p>
      </section>

      {fetchError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">Error loading driver standings.</div>
      ) : standings ? (
        <DriverStandingsTable standings={standings} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No driver standings found.</div>
      )}
    </main>
  );
}
