import Link from 'next/link';
import { RACE_WEEKEND_SESSION_LABELS, RACE_WEEKEND_SESSION_ORDER } from '@/lib/raceWeekendSessions';
import { RaceWeekendSessionAvailability, RaceWeekendSessionKey } from '@/lib/types';

interface WeekendSessionLinksProps {
  round: string;
  activeSession: RaceWeekendSessionKey;
  sessionAvailability: RaceWeekendSessionAvailability;
  hasPublishedResults: boolean;
}

function buildSessionHref(round: string, session: RaceWeekendSessionKey): string {
  const encodedRound = encodeURIComponent(round);

  if (session === 'race') {
    return `/results?round=${encodedRound}`;
  }

  return `/results?round=${encodedRound}&session=${encodeURIComponent(session)}`;
}

const WeekendSessionLinks: React.FC<WeekendSessionLinksProps> = ({
  round,
  activeSession,
  sessionAvailability,
  hasPublishedResults,
}) => {
  if (!hasPublishedResults || !round) {
    return null;
  }

  const availableSessions = RACE_WEEKEND_SESSION_ORDER.filter((session) => {
    if (session === 'race') {
      return true;
    }

    return sessionAvailability[session];
  });

  if (availableSessions.length <= 1) {
    return null;
  }

  return (
    <section className="mb-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">Weekend Sessions</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {availableSessions.map((session) => {
          const isActive = session === activeSession;

          return (
            <Link
              key={session}
              href={buildSessionHref(round, session)}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                isActive
                  ? 'border-orange-300/70 bg-orange-300/20 text-orange-100'
                  : 'border-white/15 bg-white/[0.03] text-slate-200 hover:border-orange-300/60 hover:text-white'
              }`}
            >
              {RACE_WEEKEND_SESSION_LABELS[session]}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default WeekendSessionLinks;
