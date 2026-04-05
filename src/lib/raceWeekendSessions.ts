import { RaceWeekendSessionKey } from './types';

export const RACE_WEEKEND_SESSION_ORDER: RaceWeekendSessionKey[] = [
  'race',
  'fp1',
  'fp2',
  'fp3',
  'qualy',
  'sprint-qualy',
  'sprint-race',
];

export const RACE_WEEKEND_SESSION_LABELS: Record<RaceWeekendSessionKey, string> = {
  race: 'Race',
  fp1: 'Practice 1',
  fp2: 'Practice 2',
  fp3: 'Practice 3',
  qualy: 'Qualifying',
  'sprint-qualy': 'Sprint Qualifying',
  'sprint-race': 'Sprint Race',
};

export function normalizeRaceWeekendSession(value: string): RaceWeekendSessionKey {
  const normalized = value.trim().toLowerCase();

  if ((RACE_WEEKEND_SESSION_ORDER as readonly string[]).includes(normalized)) {
    return normalized as RaceWeekendSessionKey;
  }

  return 'race';
}

export function isSprintRaceWeekendSession(session: RaceWeekendSessionKey): boolean {
  return session === 'sprint-qualy' || session === 'sprint-race';
}
