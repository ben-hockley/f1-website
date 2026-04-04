import type { Metadata } from 'next';
import ConstructorStandingsTable from '@/components/ConstructorStandingsTable';
import { getConstructorStandings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Constructor Standings',
};

export default async function ConstructorsPage() {
  let standings = null;
  let fetchError = false;

  try {
    const data = await getConstructorStandings();
    standings = data.ConstructorStandings?.length ? data.ConstructorStandings : null;
  } catch {
    fetchError = true;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-xl backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Constructor Championship</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-[0.1em] text-white sm:text-5xl">Constructor Standings</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Team performance snapshot with wins and points in the constructor title race.
        </p>
      </section>

      {fetchError ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">Error loading constructor standings.</div>
      ) : standings ? (
        <ConstructorStandingsTable standings={standings} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-slate-200">No constructor standings found.</div>
      )}
    </main>
  );
}
