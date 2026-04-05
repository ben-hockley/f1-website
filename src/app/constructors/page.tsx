import { redirect } from 'next/navigation';
import { getConstructorStandings } from '@/lib/api';

export default async function ConstructorsPage() {
  try {
    const data = await getConstructorStandings();
    const season = data.season.trim();

    if (season) {
      redirect(`/constructors/standings/${encodeURIComponent(season)}`);
    }
  } catch {
    // Fall through to a best-effort seasonal route.
  }

  redirect(`/constructors/standings/${new Date().getUTCFullYear()}`);
}
