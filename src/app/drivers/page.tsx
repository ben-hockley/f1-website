import { redirect } from 'next/navigation';
import { getDriverStandings } from '@/lib/api';

export default async function DriversPage() {
  try {
    const data = await getDriverStandings();
    const season = data.season.trim();

    if (season) {
      redirect(`/drivers/standings/${encodeURIComponent(season)}`);
    }
  } catch {
    // Fall through to a best-effort seasonal route.
  }

  redirect(`/drivers/standings/${new Date().getUTCFullYear()}`);
}
