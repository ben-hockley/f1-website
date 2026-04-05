import {
  ConstructorDirectoryEntry,
  ConstructorHistoricalDriver,
  ConstructorHistoricalResults,
  ConstructorHistoricalSeasonRow,
  ConstructorLineupData,
  ConstructorLineupDriver,
  ConstructorProfile,
  ConstructorSeasonSummary,
  ConstructorStandingsResponse,
  DriverCurrentSeasonData,
  DriverDirectoryEntry,
  DriverHistoricalResults,
  DriverHistoricalSeasonRow,
  DriverProfile,
  DriverSeasonResultRow,
  DriverStandingsResponse,
  RaceCalendarItem,
  RaceCalendarResponse,
  RaceResultsResponse,
  RaceWeekendSessionAvailability,
  RaceWeekendSessionKey,
  RaceWeekendSessionResponse,
  RaceWeekendSessionResult,
} from './types';
import { getConstructorLineageIds } from './constructorLineage';

const API_BASE_URL = (process.env.F1_API_BASE_URL ?? 'https://f1api.dev/api').replace(/\/+$/, '');
const DIRECTORY_PAGE_LIMIT = 100;
const MAX_DIRECTORY_PAGES = 40;
const DIRECTORY_REVALIDATE_SECONDS = 60 * 60 * 6;
const HISTORICAL_REVALIDATE_SECONDS = 60 * 60 * 12;
const SEASONS_PAGE_LIMIT = 30;
const MAX_SEASONS_PAGES = 12;
const HISTORICAL_FETCH_CONCURRENCY = 6;
const CONSTRUCTORS_CHAMPIONSHIP_START_YEAR = 1958;

type RaceSessionResultsField =
  | 'results'
  | 'qualyResults'
  | 'fp1Results'
  | 'fp2Results'
  | 'fp3Results'
  | 'sprintQualyResults'
  | 'sprintRaceResults';

const SESSION_ENDPOINT_BY_KEY: Record<RaceWeekendSessionKey, string> = {
  race: 'race',
  fp1: 'fp1',
  fp2: 'fp2',
  fp3: 'fp3',
  qualy: 'qualy',
  'sprint-qualy': 'sprint/qualy',
  'sprint-race': 'sprint/race',
};

const SESSION_RESULTS_FIELD_BY_KEY: Record<RaceWeekendSessionKey, RaceSessionResultsField> = {
  race: 'results',
  fp1: 'fp1Results',
  fp2: 'fp2Results',
  fp3: 'fp3Results',
  qualy: 'qualyResults',
  'sprint-qualy': 'sprintQualyResults',
  'sprint-race': 'sprintRaceResults',
};

interface ApiDriverItem {
  driverId?: string;
  name?: string;
  surname?: string;
  birthday?: string;
  nationality?: string;
  number?: string | number | null;
  shortName?: string | null;
  url?: string;
  points?: string | number | null;
  position?: string | number | null;
  wins?: string | number | null;
}

interface ApiTeamItem {
  teamId?: string;
  teamName?: string;
  teamNationality?: string;
  nationality?: string;
  country?: string;
  firstAppeareance?: string | number | null;
  constructorsChampionships?: string | number | null;
  driversChampionships?: string | number | null;
  points?: string | number | null;
  position?: string | number | null;
  wins?: string | number | null;
  url?: string;
}

interface ApiDriverChampionshipItem {
  position: string | number;
  points: string | number;
  wins: string | number;
  driverId: string;
  teamId?: string;
  driver: {
    name: string;
    surname: string;
    birthday?: string;
    nationality?: string;
    number?: string | number;
    shortName?: string;
  };
  team?: {
    teamId?: string;
    teamName?: string;
    nationality?: string;
    country?: string;
  };
}

interface ApiDriverChampionshipResponse {
  season?: string | number;
  drivers_championship?: ApiDriverChampionshipItem | ApiDriverChampionshipItem[];
}

interface ApiConstructorChampionshipItem {
  position: string | number;
  points: string | number;
  wins: string | number;
  teamId?: string;
  team?: {
    teamId?: string;
    teamName?: string;
    nationality?: string;
    country?: string;
  };
}

interface ApiConstructorChampionshipResponse {
  season?: string | number;
  constructors_championship?: ApiConstructorChampionshipItem | ApiConstructorChampionshipItem[];
}

interface ApiRaceCircuit {
  circuitId?: string;
  circuitName?: string;
  country?: string;
  city?: string;
}

interface ApiRaceResultItem {
  position?: string | number;
  points?: string | number;
  grid?: string | number | null;
  gridPosition?: string | number | null;
  time?: string;
  fastLap?: string;
  retired?: string | null;
  q1?: string;
  q2?: string;
  q3?: string;
  sq1?: string;
  sq2?: string;
  sq3?: string;
  driver?: {
    driverId?: string;
    shortName?: string;
    name?: string;
    surname?: string;
    nationality?: string;
  };
  team?: {
    teamId?: string;
    teamName?: string;
    teamNationality?: string;
    nationality?: string;
    country?: string;
  };
}

interface ApiRaceItem {
  raceId?: string;
  round?: string | number;
  date?: string;
  time?: string;
  qualyDate?: string;
  qualyTime?: string;
  fp1Date?: string;
  fp1Time?: string;
  fp2Date?: string;
  fp2Time?: string;
  fp3Date?: string;
  fp3Time?: string;
  url?: string;
  raceName?: string;
  circuit?: ApiRaceCircuit | ApiRaceCircuit[];
  schedule?: {
    race?: {
      date?: string;
      time?: string;
    };
    qualy?: {
      date?: string | null;
      time?: string | null;
    };
    fp1?: {
      date?: string | null;
      time?: string | null;
    };
    fp2?: {
      date?: string | null;
      time?: string | null;
    };
    fp3?: {
      date?: string | null;
      time?: string | null;
    };
    sprintQualy?: {
      date?: string | null;
      time?: string | null;
    };
    sprintRace?: {
      date?: string | null;
      time?: string | null;
    };
  };
  winner?: unknown;
  teamWinner?: unknown;
  results?: ApiRaceResultItem | ApiRaceResultItem[];
  qualyResults?: ApiRaceResultItem | ApiRaceResultItem[];
  fp1Results?: ApiRaceResultItem | ApiRaceResultItem[];
  fp2Results?: ApiRaceResultItem | ApiRaceResultItem[];
  fp3Results?: ApiRaceResultItem | ApiRaceResultItem[];
  sprintQualyResults?: ApiRaceResultItem | ApiRaceResultItem[];
  sprintRaceResults?: ApiRaceResultItem | ApiRaceResultItem[];
}

interface ApiRaceResultsResponse {
  season?: string | number;
  race?: ApiRaceItem | ApiRaceItem[];
  races?: ApiRaceItem | ApiRaceItem[];
}

interface ApiCurrentRacesResponse {
  season?: string | number;
  races?: ApiRaceItem | ApiRaceItem[];
}

interface ApiSeasonChampionship {
  championshipId?: string;
  year?: string | number;
}

interface ApiSeasonsResponse {
  limit?: string | number;
  offset?: string | number;
  total?: string | number;
  championships?: ApiSeasonChampionship | ApiSeasonChampionship[];
}

interface ApiDriversDirectoryResponse {
  limit?: string | number;
  offset?: string | number;
  total?: string | number;
  drivers?: ApiDriverItem | ApiDriverItem[];
}

interface ApiTeamsDirectoryResponse {
  limit?: string | number;
  offset?: string | number;
  total?: string | number;
  teams?: ApiTeamItem | ApiTeamItem[];
}

interface ApiDriverProfileResponse {
  driver?: ApiDriverItem | ApiDriverItem[];
}

interface ApiTeamProfileResponse {
  season?: string | number;
  championshipId?: string;
  team?: ApiTeamItem | ApiTeamItem[];
}

interface ApiCurrentDriverRaceResult {
  race?: {
    round?: string | number;
    name?: string;
    date?: string;
    circuit?: {
      name?: string;
      country?: string;
      city?: string;
    };
  };
  result?: {
    finishingPosition?: string | number;
    gridPosition?: string | number;
    raceTime?: string | number | null;
    pointsObtained?: string | number | null;
    retired?: string | boolean | null;
  };
  sprintResult?: {
    finishingPosition?: string | number;
    gridPosition?: string | number;
    raceTime?: string | number | null;
    pointsObtained?: string | number | null;
    retired?: string | boolean | null;
  };
}

interface ApiCurrentDriverResponse {
  season?: string | number;
  championshipId?: string;
  driver?: ApiDriverItem;
  team?: ApiTeamItem;
  results?: ApiCurrentDriverRaceResult | ApiCurrentDriverRaceResult[];
}

interface ApiTeamDriversResponse {
  season?: string | number;
  teamId?: string;
  team?: ApiTeamItem;
  drivers?:
    | {
        driver?: ApiDriverItem;
      }
    | Array<{
        driver?: ApiDriverItem;
      }>;
}

interface HistoricalResultsOptions {
  maxSeasons?: number;
}

function toText(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function normalizeId(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function toRaceDateTimestamp(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = trimmed.includes('T') ? trimmed : `${trimmed}T23:59:59Z`;
  const timestamp = Date.parse(candidate);
  return Number.isNaN(timestamp) ? null : timestamp;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;

      if (index >= items.length) {
        return;
      }

      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function mapYearsWithEarlyLimit<R>(
  years: readonly number[],
  concurrency: number,
  maxResults: number,
  mapper: (year: number) => Promise<R | null>,
): Promise<R[]> {
  const normalizedConcurrency = Math.max(1, concurrency);
  const results: R[] = [];

  for (let index = 0; index < years.length; index += normalizedConcurrency) {
    const batch = years.slice(index, index + normalizedConcurrency);
    const batchResults = await Promise.all(batch.map((year) => mapper(year)));

    for (const result of batchResults) {
      if (!result) {
        continue;
      }

      results.push(result);

      if (results.length >= maxResults) {
        return results;
      }
    }
  }

  return results;
}

function normalizeMaxSeasons(maxSeasons: number | undefined): number | null {
  if (typeof maxSeasons !== 'number' || !Number.isFinite(maxSeasons)) {
    return null;
  }

  const rounded = Math.floor(maxSeasons);
  return rounded > 0 ? rounded : null;
}

function is404Error(error: unknown): boolean {
  return error instanceof Error && /Status:\s*404/.test(error.message);
}

function mapDriverProfile(driver: ApiDriverItem | undefined): DriverProfile {
  return {
    driverId: driver?.driverId ?? '',
    permanentNumber: toText(driver?.number),
    code: driver?.shortName ?? '',
    givenName: driver?.name ?? '',
    familyName: driver?.surname ?? '',
    dateOfBirth: driver?.birthday ?? '',
    nationality: driver?.nationality ?? '',
    url: driver?.url ?? '',
  };
}

function mapConstructorProfile(team: ApiTeamItem | undefined): ConstructorProfile {
  return {
    constructorId: team?.teamId ?? '',
    name: team?.teamName ?? '',
    nationality: team?.teamNationality ?? team?.nationality ?? team?.country ?? '',
    firstAppearance: toText(team?.firstAppeareance),
    constructorsChampionships: toText(team?.constructorsChampionships),
    driversChampionships: toText(team?.driversChampionships),
    url: team?.url ?? '',
  };
}

function mapCurrentDriverRaceResultRow(item: ApiCurrentDriverRaceResult): DriverSeasonResultRow {
  return {
    round: toText(item.race?.round),
    raceName: item.race?.name ?? '',
    date: item.race?.date ?? '',
    circuitName: item.race?.circuit?.name ?? '',
    circuitCountry: item.race?.circuit?.country ?? '',
    circuitCity: item.race?.circuit?.city ?? '',
    finishingPosition: toText(item.result?.finishingPosition),
    gridPosition: toText(item.result?.gridPosition),
    raceTime: toText(item.result?.raceTime),
    points: toText(item.result?.pointsObtained),
    sprintFinishingPosition: toText(item.sprintResult?.finishingPosition),
    sprintPoints: toText(item.sprintResult?.pointsObtained),
    sprintRaceTime: toText(item.sprintResult?.raceTime),
  };
}

function mapDriverStandingsResponse(data: ApiDriverChampionshipResponse): DriverStandingsResponse {
  const standings = toArray(data.drivers_championship);

  return {
    season: toText(data.season),
    round: '',
    DriverStandings: standings.map((item) => ({
      position: toText(item.position),
      points: toText(item.points),
      wins: toText(item.wins),
      Driver: {
        driverId: item.driverId,
        permanentNumber: toText(item.driver.number),
        code: item.driver.shortName ?? '',
        givenName: item.driver.name,
        familyName: item.driver.surname,
        dateOfBirth: item.driver.birthday ?? '',
        nationality: item.driver.nationality ?? '',
      },
      Constructor: {
        constructorId: item.team?.teamId ?? item.teamId ?? '',
        name: item.team?.teamName ?? '',
        nationality: item.team?.nationality ?? item.team?.country ?? '',
      },
    })),
  };
}

function mapConstructorStandingsResponse(data: ApiConstructorChampionshipResponse): ConstructorStandingsResponse {
  const standings = toArray(data.constructors_championship);

  return {
    season: toText(data.season),
    round: '',
    ConstructorStandings: standings.map((item) => ({
      position: toText(item.position),
      points: toText(item.points),
      wins: toText(item.wins),
      Constructor: {
        constructorId: item.team?.teamId ?? item.teamId ?? '',
        name: item.team?.teamName ?? '',
        nationality: item.team?.nationality ?? item.team?.country ?? '',
      },
    })),
  };
}

function getRaceFromResponse(data: ApiRaceResultsResponse): ApiRaceItem | undefined {
  return toArray(data.races ?? data.race)[0];
}

function getRaceCircuit(race: ApiRaceItem | undefined): ApiRaceCircuit | undefined {
  return toArray(race?.circuit)[0];
}

function getRaceDate(race: ApiRaceItem | undefined): string {
  return race?.date ?? race?.schedule?.race?.date ?? '';
}

function getSessionDate(race: ApiRaceItem | undefined, session: RaceWeekendSessionKey): string {
  if (!race) {
    return '';
  }

  switch (session) {
    case 'race':
      return getRaceDate(race);
    case 'qualy':
      return race.qualyDate ?? race.schedule?.qualy?.date ?? '';
    case 'fp1':
      return race.fp1Date ?? race.schedule?.fp1?.date ?? '';
    case 'fp2':
      return race.fp2Date ?? race.schedule?.fp2?.date ?? '';
    case 'fp3':
      return race.fp3Date ?? race.schedule?.fp3?.date ?? '';
    case 'sprint-qualy':
      return race.date ?? race.schedule?.sprintQualy?.date ?? '';
    case 'sprint-race':
      return race.date ?? race.schedule?.sprintRace?.date ?? '';
    default:
      return getRaceDate(race);
  }
}

function mapRaceWeekendSessionAvailability(race: ApiRaceItem): RaceWeekendSessionAvailability {
  return {
    race: Boolean(getRaceDate(race)),
    fp1: Boolean(race.schedule?.fp1?.date ?? race.fp1Date),
    fp2: Boolean(race.schedule?.fp2?.date ?? race.fp2Date),
    fp3: Boolean(race.schedule?.fp3?.date ?? race.fp3Date),
    qualy: Boolean(race.schedule?.qualy?.date ?? race.qualyDate),
    'sprint-qualy': Boolean(race.schedule?.sprintQualy?.date),
    'sprint-race': Boolean(race.schedule?.sprintRace?.date),
  };
}

function mapResultDriver(result: ApiRaceResultItem, fallbackDriverId: string): RaceWeekendSessionResult['Driver'] {
  return {
    driverId: result.driver?.driverId ?? fallbackDriverId,
    code: result.driver?.shortName ?? '',
    givenName: result.driver?.name ?? '',
    familyName: result.driver?.surname ?? '',
    nationality: result.driver?.nationality ?? '',
  };
}

function mapResultConstructor(result: ApiRaceResultItem): RaceWeekendSessionResult['Constructor'] {
  return {
    constructorId: result.team?.teamId ?? '',
    name: result.team?.teamName ?? result.team?.teamId ?? '',
    nationality: result.team?.teamNationality ?? result.team?.nationality ?? result.team?.country ?? '',
  };
}

function mapWeekendSessionResult(
  race: ApiRaceItem,
  session: RaceWeekendSessionKey,
  result: ApiRaceResultItem,
  index: number,
): RaceWeekendSessionResult {
  const fallbackDriverId = `${race.raceId ?? race.raceName ?? 'race'}-${index + 1}`;
  const defaultPosition = String(index + 1);

  const position =
    session === 'race'
      ? toText(result.position)
      : session === 'sprint-race'
        ? toText(result.position) || defaultPosition
        : session === 'qualy' || session === 'sprint-qualy'
          ? toText(result.gridPosition ?? result.position) || defaultPosition
          : defaultPosition;

  const points = session === 'race' || session === 'sprint-race' ? toText(result.points) : '';

  const grid =
    session === 'race'
      ? toText(result.grid)
      : session === 'qualy' || session === 'sprint-qualy' || session === 'sprint-race'
        ? toText(result.gridPosition ?? result.grid)
        : '';

  const time =
    session === 'qualy'
      ? toText(result.q3) || toText(result.q2) || toText(result.q1)
      : session === 'sprint-qualy'
        ? toText(result.sq3) || toText(result.sq2) || toText(result.sq1)
        : toText(result.time);

  return {
    position,
    points,
    Driver: mapResultDriver(result, fallbackDriverId),
    Constructor: mapResultConstructor(result),
    grid,
    time,
    q1: session === 'qualy' ? toText(result.q1) : session === 'sprint-qualy' ? toText(result.sq1) : '',
    q2: session === 'qualy' ? toText(result.q2) : session === 'sprint-qualy' ? toText(result.sq2) : '',
    q3: session === 'qualy' ? toText(result.q3) : session === 'sprint-qualy' ? toText(result.sq3) : '',
  };
}

function mapRaceResultsResponse(data: ApiRaceResultsResponse): RaceResultsResponse {
  const race = getRaceFromResponse(data);

  if (!race) {
    throw new Error('No race data returned from API.');
  }

  const circuit = getRaceCircuit(race);
  const results = toArray(race.results);

  return {
    season: toText(data.season),
    round: toText(race.round),
    Race: {
      raceName: race.raceName ?? '',
      date: getRaceDate(race),
      Circuit: {
        circuitId: circuit?.circuitId ?? '',
        circuitName: circuit?.circuitName ?? '',
        Location: {
          country: circuit?.country ?? '',
          locality: circuit?.city ?? '',
        },
      },
      Results: results.map((result, index) => {
        const mappedResult = mapWeekendSessionResult(race, 'race', result, index);

        return {
          position: mappedResult.position,
          points: mappedResult.points,
          Driver: mappedResult.Driver,
          Constructor: mappedResult.Constructor,
          grid: mappedResult.grid,
          laps: '',
          status: result.retired ? String(result.retired) : result.position ? 'Finished' : 'Not Started',
          Time: mappedResult.time ? { millis: '', time: mappedResult.time } : undefined,
          FastestLap: result.fastLap
            ? {
                rank: '',
                lap: '',
                Time: { time: result.fastLap },
              }
            : undefined,
        };
      }),
    },
  };
}

function mapRaceWeekendSessionResultsResponse(
  data: ApiRaceResultsResponse,
  session: RaceWeekendSessionKey,
): RaceWeekendSessionResponse {
  const race = getRaceFromResponse(data);

  if (!race) {
    throw new Error('No race session data returned from API.');
  }

  const circuit = getRaceCircuit(race);
  const sessionResultsField = SESSION_RESULTS_FIELD_BY_KEY[session];
  const results = toArray(race[sessionResultsField]);

  return {
    season: toText(data.season),
    round: toText(race.round),
    session,
    raceName: race.raceName ?? '',
    date: getSessionDate(race, session),
    Circuit: {
      circuitId: circuit?.circuitId ?? '',
      circuitName: circuit?.circuitName ?? '',
      Location: {
        country: circuit?.country ?? '',
        locality: circuit?.city ?? '',
      },
    },
    Results: results.map((result, index) => mapWeekendSessionResult(race, session, result, index)),
  };
}

function mapRaceCalendarItem(race: ApiRaceItem): RaceCalendarItem {
  const circuit = getRaceCircuit(race);
  const resultCount = toArray(race.results).length;
  const sessionAvailability = mapRaceWeekendSessionAvailability(race);

  return {
    round: toText(race.round),
    raceName: race.raceName ?? '',
    date: getRaceDate(race),
    circuitName: circuit?.circuitName ?? '',
    circuitCountry: circuit?.country ?? '',
    circuitCity: circuit?.city ?? '',
    hasResults: resultCount > 0 || Boolean(race.winner) || Boolean(race.teamWinner),
    sessionAvailability,
    hasSprint: sessionAvailability['sprint-qualy'] || sessionAvailability['sprint-race'],
  };
}

function getCurrentRoundFromCalendar(races: RaceCalendarItem[]): string {
  if (races.length === 0) {
    return '';
  }

  const now = Date.now();

  for (const race of races) {
    const timestamp = toRaceDateTimestamp(race.date);
    if (timestamp !== null && timestamp >= now) {
      return race.round;
    }
  }

  const scheduledRace = races.find((race) => !race.hasResults && toRaceDateTimestamp(race.date) === null);
  if (scheduledRace?.round) {
    return scheduledRace.round;
  }

  return races[races.length - 1]?.round ?? '';
}

function getLatestCompletedRoundFromCalendar(races: RaceCalendarItem[]): string {
  for (let index = races.length - 1; index >= 0; index -= 1) {
    if (races[index]?.hasResults) {
      return races[index].round;
    }
  }

  const now = Date.now();
  let latestPastRound = '';

  for (const race of races) {
    const timestamp = toRaceDateTimestamp(race.date);
    if (timestamp !== null && timestamp < now) {
      latestPastRound = race.round;
    }
  }

  return latestPastRound;
}

async function fetchF1Data<T>(endpoint: string, revalidateSeconds = 300): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${endpoint}. Status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function getAllDriverDirectoryItems(): Promise<ApiDriverItem[]> {
  const items: ApiDriverItem[] = [];
  let offset = 0;
  let previousFirstId = '';

  for (let page = 0; page < MAX_DIRECTORY_PAGES; page += 1) {
    const response = await fetchF1Data<ApiDriversDirectoryResponse>(
      `/drivers?limit=${DIRECTORY_PAGE_LIMIT}&offset=${offset}`,
      DIRECTORY_REVALIDATE_SECONDS,
    );
    const chunk = toArray(response.drivers);

    if (chunk.length === 0) {
      break;
    }

    const firstId = chunk[0]?.driverId ?? '';
    if (page > 0 && firstId && firstId === previousFirstId) {
      break;
    }

    previousFirstId = firstId;
    items.push(...chunk);

    if (chunk.length < DIRECTORY_PAGE_LIMIT) {
      break;
    }

    offset += DIRECTORY_PAGE_LIMIT;
  }

  return items;
}

async function getAllConstructorDirectoryItems(): Promise<ApiTeamItem[]> {
  const items: ApiTeamItem[] = [];
  let offset = 0;
  let previousFirstId = '';

  for (let page = 0; page < MAX_DIRECTORY_PAGES; page += 1) {
    const response = await fetchF1Data<ApiTeamsDirectoryResponse>(
      `/teams?limit=${DIRECTORY_PAGE_LIMIT}&offset=${offset}`,
      DIRECTORY_REVALIDATE_SECONDS,
    );
    const chunk = toArray(response.teams);

    if (chunk.length === 0) {
      break;
    }

    const firstId = chunk[0]?.teamId ?? '';
    if (page > 0 && firstId && firstId === previousFirstId) {
      break;
    }

    previousFirstId = firstId;
    items.push(...chunk);

    if (chunk.length < DIRECTORY_PAGE_LIMIT) {
      break;
    }

    offset += DIRECTORY_PAGE_LIMIT;
  }

  return items;
}

async function getAllSeasonYears(): Promise<number[]> {
  const years: number[] = [];
  let offset = 0;
  let previousFirstYear = 0;

  for (let page = 0; page < MAX_SEASONS_PAGES; page += 1) {
    const response = await fetchF1Data<ApiSeasonsResponse>(
      `/seasons?limit=${SEASONS_PAGE_LIMIT}&offset=${offset}`,
      HISTORICAL_REVALIDATE_SECONDS,
    );
    const chunk = toArray(response.championships);

    if (chunk.length === 0) {
      break;
    }

    const firstYear = Number.parseInt(toText(chunk[0]?.year), 10);
    if (page > 0 && Number.isFinite(firstYear) && firstYear === previousFirstYear) {
      break;
    }

    if (Number.isFinite(firstYear)) {
      previousFirstYear = firstYear;
    }

    for (const item of chunk) {
      const year = Number.parseInt(toText(item.year), 10);
      if (Number.isFinite(year)) {
        years.push(year);
      }
    }

    if (chunk.length < SEASONS_PAGE_LIMIT) {
      break;
    }

    offset += SEASONS_PAGE_LIMIT;
  }

  return Array.from(new Set(years)).sort((left, right) => right - left);
}

export async function getAllDriversDirectory(): Promise<DriverDirectoryEntry[]> {
  const items = await getAllDriverDirectoryItems();
  const byId = new Map<string, DriverDirectoryEntry>();

  for (const item of items) {
    const driverId = item.driverId?.trim();
    if (!driverId) {
      continue;
    }

    const key = driverId.toLowerCase();
    if (byId.has(key)) {
      continue;
    }

    byId.set(key, {
      driverId,
      givenName: item.name?.trim() || driverId,
      familyName: item.surname?.trim() || '',
      nationality: item.nationality?.trim() || '',
    });
  }

  return Array.from(byId.values()).sort((left, right) => {
    const leftLabel = `${left.familyName} ${left.givenName}`.trim();
    const rightLabel = `${right.familyName} ${right.givenName}`.trim();
    return leftLabel.localeCompare(rightLabel);
  });
}

export async function getAllConstructorsDirectory(): Promise<ConstructorDirectoryEntry[]> {
  const items = await getAllConstructorDirectoryItems();
  const byId = new Map<string, ConstructorDirectoryEntry>();

  for (const item of items) {
    const constructorId = item.teamId?.trim();
    if (!constructorId) {
      continue;
    }

    const key = constructorId.toLowerCase();
    if (byId.has(key)) {
      continue;
    }

    byId.set(key, {
      constructorId,
      name: item.teamName?.trim() || constructorId,
      nationality: item.teamNationality?.trim() || item.nationality?.trim() || item.country?.trim() || '',
    });
  }

  return Array.from(byId.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export async function getDriverProfile(driverId: string): Promise<DriverProfile | null> {
  const normalizedDriverId = driverId.trim();
  if (!normalizedDriverId) {
    return null;
  }

  try {
    const response = await fetchF1Data<ApiDriverProfileResponse>(`/drivers/${encodeURIComponent(normalizedDriverId)}`);
    const driver = toArray(response.driver)[0];

    if (!driver?.driverId) {
      return null;
    }

    return mapDriverProfile(driver);
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

export async function getConstructorProfile(constructorId: string): Promise<ConstructorProfile | null> {
  const normalizedConstructorId = constructorId.trim();
  if (!normalizedConstructorId) {
    return null;
  }

  try {
    const response = await fetchF1Data<ApiTeamProfileResponse>(`/teams/${encodeURIComponent(normalizedConstructorId)}`);
    const constructor = toArray(response.team)[0];

    if (!constructor?.teamId) {
      return null;
    }

    return mapConstructorProfile(constructor);
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

export async function getDriverCurrentSeason(driverId: string): Promise<DriverCurrentSeasonData | null> {
  const normalizedDriverId = driverId.trim();
  if (!normalizedDriverId) {
    return null;
  }

  try {
    const response = await fetchF1Data<ApiCurrentDriverResponse>(`/current/drivers/${encodeURIComponent(normalizedDriverId)}`);

    if (!response.driver?.driverId) {
      return null;
    }

    const results = toArray(response.results)
      .map(mapCurrentDriverRaceResultRow)
      .sort((left, right) => toNumber(left.round) - toNumber(right.round));

    const points = results.reduce((total, result) => total + toNumber(result.points), 0);
    const wins = results.filter((result) => result.finishingPosition === '1').length;
    const podiums = results.filter((result) => ['1', '2', '3'].includes(result.finishingPosition)).length;
    const bestFinishCandidates = results
      .map((result) => Number.parseInt(result.finishingPosition, 10))
      .filter((position) => Number.isFinite(position));

    return {
      season: toText(response.season),
      championshipId: response.championshipId ?? '',
      team: mapConstructorProfile(response.team),
      summary: {
        races: toText(results.length),
        points: toText(points),
        wins: toText(wins),
        podiums: toText(podiums),
        bestFinish: bestFinishCandidates.length ? toText(Math.min(...bestFinishCandidates)) : '',
      },
      results,
    };
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

export async function getConstructorCurrentSeason(constructorId: string): Promise<ConstructorSeasonSummary | null> {
  const normalizedConstructorId = constructorId.trim();
  if (!normalizedConstructorId) {
    return null;
  }

  try {
    const response = await fetchF1Data<ApiTeamProfileResponse>(`/current/teams/${encodeURIComponent(normalizedConstructorId)}`);
    const constructor = toArray(response.team)[0];

    if (!constructor?.teamId) {
      return null;
    }

    return {
      season: toText(response.season),
      championshipId: response.championshipId ?? '',
      constructor: mapConstructorProfile(constructor),
      points: toText(constructor.points),
      position: toText(constructor.position),
      wins: toText(constructor.wins),
    };
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

export async function getConstructorCurrentDrivers(constructorId: string): Promise<ConstructorLineupData | null> {
  const normalizedConstructorId = constructorId.trim();
  if (!normalizedConstructorId) {
    return null;
  }

  try {
    const response = await fetchF1Data<ApiTeamDriversResponse>(
      `/current/teams/${encodeURIComponent(normalizedConstructorId)}/drivers`,
    );

    const lineup = toArray(response.drivers)
      .map((item) => item.driver)
      .filter((driver): driver is ApiDriverItem => Boolean(driver?.driverId))
      .map<ConstructorLineupDriver>((driver) => ({
        driverId: driver.driverId ?? '',
        number: toText(driver.number) ?? '',
        givenName: driver.name ?? '',
        familyName: driver.surname ?? '',
        nationality: driver.nationality ?? '',
        dateOfBirth: driver.birthday ?? '',
        permanentNumber: toText(driver.number),
        code: driver.shortName ?? '',
        url: driver.url ?? '',
        points: toText(driver.points),
        position: toText(driver.position),
        wins: toText(driver.wins),
      }))
      .sort((left, right) => {
        const leftPos = Number.parseInt(left.position, 10);
        const rightPos = Number.parseInt(right.position, 10);

        if (Number.isFinite(leftPos) && Number.isFinite(rightPos)) {
          return leftPos - rightPos;
        }

        if (Number.isFinite(leftPos)) {
          return -1;
        }

        if (Number.isFinite(rightPos)) {
          return 1;
        }

        const leftName = `${left.familyName} ${left.givenName}`.trim();
        const rightName = `${right.familyName} ${right.givenName}`.trim();
        return leftName.localeCompare(rightName);
      });

    if (!response.team?.teamId && lineup.length === 0) {
      return null;
    }

    return {
      season: toText(response.season),
      constructorId: response.team?.teamId ?? response.teamId ?? normalizedConstructorId,
      teamName: response.team?.teamName ?? '',
      points: toText(response.team?.points),
      position: toText(response.team?.position),
      wins: toText(response.team?.wins),
      drivers: lineup,
    };
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

async function getConstructorDriversBySeason(constructorId: string, year: number): Promise<ConstructorHistoricalDriver[]> {
  try {
    const response = await fetchF1Data<ApiTeamDriversResponse>(
      `/${year}/teams/${encodeURIComponent(constructorId)}/drivers`,
      HISTORICAL_REVALIDATE_SECONDS,
    );

    return toArray(response.drivers)
      .map((item) => item.driver)
      .filter((driver): driver is ApiDriverItem => Boolean(driver?.driverId))
      .map<ConstructorHistoricalDriver>((driver) => ({
        driverId: driver.driverId ?? '',
        givenName: driver.name ?? '',
        familyName: driver.surname ?? '',
        nationality: driver.nationality ?? '',
        points: toText(driver.points),
        position: toText(driver.position),
        wins: toText(driver.wins),
      }))
      .sort((left, right) => {
        const leftPos = Number.parseInt(left.position, 10);
        const rightPos = Number.parseInt(right.position, 10);

        if (Number.isFinite(leftPos) && Number.isFinite(rightPos)) {
          return leftPos - rightPos;
        }

        if (Number.isFinite(leftPos)) {
          return -1;
        }

        if (Number.isFinite(rightPos)) {
          return 1;
        }

        const leftName = `${left.familyName} ${left.givenName}`.trim();
        const rightName = `${right.familyName} ${right.givenName}`.trim();
        return leftName.localeCompare(rightName);
      });
  } catch (error) {
    if (is404Error(error)) {
      return [];
    }

    console.error(`Unable to fetch constructor lineup for ${constructorId} in ${year}:`, error);
    return [];
  }
}

export async function getDriverHistoricalResults(
  driverId: string,
  options: HistoricalResultsOptions = {},
): Promise<DriverHistoricalResults> {
  const normalizedDriverId = driverId.trim();
  if (!normalizedDriverId) {
    return { driverId: '', seasons: [] };
  }

  const lookupId = normalizeId(normalizedDriverId);
  const years = await getAllSeasonYears();

  const mapYearToHistoricalRow = async (year: number): Promise<DriverHistoricalSeasonRow | null> => {
    try {
      const response = await fetchF1Data<ApiDriverChampionshipResponse>(
        `/${year}/drivers-championship`,
        HISTORICAL_REVALIDATE_SECONDS,
      );
      const standing = toArray(response.drivers_championship).find((entry) => normalizeId(entry.driverId) === lookupId);

      if (!standing) {
        return null;
      }

      return {
        season: toText(response.season) || toText(year),
        position: toText(standing.position),
        points: toText(standing.points),
        wins: toText(standing.wins),
        constructor: {
          constructorId: standing.team?.teamId ?? standing.teamId ?? '',
          name: standing.team?.teamName ?? standing.team?.teamId ?? standing.teamId ?? '',
          nationality: standing.team?.nationality ?? standing.team?.country ?? '',
        },
      } satisfies DriverHistoricalSeasonRow;
    } catch (error) {
      if (!is404Error(error)) {
        console.error(`Unable to fetch driver standings for ${year}:`, error);
      }

      return null;
    }
  };

  const maxSeasons = normalizeMaxSeasons(options.maxSeasons);

  const rows =
    maxSeasons === null
      ? await mapWithConcurrency(years, HISTORICAL_FETCH_CONCURRENCY, mapYearToHistoricalRow)
      : await mapYearsWithEarlyLimit(years, HISTORICAL_FETCH_CONCURRENCY, maxSeasons, mapYearToHistoricalRow);

  const seasons = rows
    .filter((row): row is DriverHistoricalSeasonRow => Boolean(row))
    .sort((left, right) => toNumber(right.season) - toNumber(left.season));

  return {
    driverId: normalizedDriverId,
    seasons,
  };
}

export async function getConstructorHistoricalResults(
  constructorId: string,
  currentName = '',
  options: HistoricalResultsOptions = {},
): Promise<ConstructorHistoricalResults> {
  const normalizedConstructorId = constructorId.trim();
  if (!normalizedConstructorId) {
    return {
      constructorId: '',
      lineageConstructorIds: [],
      seasons: [],
      previousConstructorNames: [],
    };
  }

  const lineageConstructorIds = getConstructorLineageIds(normalizedConstructorId);
  const lineageLookup = new Set(lineageConstructorIds.map(normalizeId));
  const years = (await getAllSeasonYears()).filter((year) => year >= CONSTRUCTORS_CHAMPIONSHIP_START_YEAR);

  const mapYearToHistoricalRow = async (year: number): Promise<ConstructorHistoricalSeasonRow | null> => {
    try {
      const response = await fetchF1Data<ApiConstructorChampionshipResponse>(
        `/${year}/constructors-championship`,
        HISTORICAL_REVALIDATE_SECONDS,
      );
      const standing = toArray(response.constructors_championship).find((entry) => {
        const candidateId = normalizeId(entry.team?.teamId ?? entry.teamId ?? '');
        return candidateId ? lineageLookup.has(candidateId) : false;
      });

      if (!standing) {
        return null;
      }

      const matchedConstructorId = (standing.team?.teamId ?? standing.teamId ?? '').trim() || normalizedConstructorId;
      const drivers = await getConstructorDriversBySeason(matchedConstructorId, year);

      return {
        season: toText(response.season) || toText(year),
        constructorId: matchedConstructorId,
        constructorName: standing.team?.teamName ?? matchedConstructorId,
        position: toText(standing.position),
        points: toText(standing.points),
        wins: toText(standing.wins),
        drivers,
      } satisfies ConstructorHistoricalSeasonRow;
    } catch (error) {
      if (!is404Error(error)) {
        console.error(`Unable to fetch constructor standings for ${year}:`, error);
      }

      return null;
    }
  };

  const maxSeasons = normalizeMaxSeasons(options.maxSeasons);

  const rows =
    maxSeasons === null
      ? await mapWithConcurrency(years, HISTORICAL_FETCH_CONCURRENCY, mapYearToHistoricalRow)
      : await mapYearsWithEarlyLimit(years, HISTORICAL_FETCH_CONCURRENCY, maxSeasons, mapYearToHistoricalRow);

  const seasons = rows
    .filter((row): row is ConstructorHistoricalSeasonRow => Boolean(row))
    .sort((left, right) => toNumber(right.season) - toNumber(left.season));

  const normalizedCurrentName = currentName.trim().toLowerCase();
  const previousConstructorNames: string[] = [];
  const nameLookup = new Set<string>();

  for (const row of seasons) {
    const name = row.constructorName.trim();
    if (!name) {
      continue;
    }

    const lookup = name.toLowerCase();
    if (normalizedCurrentName && lookup === normalizedCurrentName) {
      continue;
    }

    if (nameLookup.has(lookup)) {
      continue;
    }

    nameLookup.add(lookup);
    previousConstructorNames.push(name);
  }

  return {
    constructorId: normalizedConstructorId,
    lineageConstructorIds,
    seasons,
    previousConstructorNames,
  };
}

export async function getCurrentSeasonRaceCalendar(): Promise<RaceCalendarResponse> {
  const response = await fetchF1Data<ApiCurrentRacesResponse>('/current', 60 * 30);

  const races = toArray(response.races)
    .map(mapRaceCalendarItem)
    .filter((race) => Boolean(race.round))
    .sort((left, right) => toNumber(left.round) - toNumber(right.round));

  return {
    season: toText(response.season),
    races,
    currentRound: getCurrentRoundFromCalendar(races),
    latestCompletedRound: getLatestCompletedRoundFromCalendar(races),
  };
}

export async function getRaceResultsByRound(season: string, round: string): Promise<RaceResultsResponse | null> {
  const normalizedSeason = season.trim();
  const normalizedRound = round.trim();

  if (!normalizedSeason || !normalizedRound) {
    return null;
  }

  try {
    const response = await fetchF1Data<ApiRaceResultsResponse>(
      `/${encodeURIComponent(normalizedSeason)}/${encodeURIComponent(normalizedRound)}/race`,
    );

    return mapRaceResultsResponse(response);
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

export async function getRaceWeekendSessionResultsByRound(
  season: string,
  round: string,
  session: RaceWeekendSessionKey,
): Promise<RaceWeekendSessionResponse | null> {
  const normalizedSeason = season.trim();
  const normalizedRound = round.trim();

  if (!normalizedSeason || !normalizedRound) {
    return null;
  }

  const endpoint = SESSION_ENDPOINT_BY_KEY[session];

  try {
    const response = await fetchF1Data<ApiRaceResultsResponse>(
      `/${encodeURIComponent(normalizedSeason)}/${encodeURIComponent(normalizedRound)}/${endpoint}`,
    );

    return mapRaceWeekendSessionResultsResponse(response, session);
  } catch (error) {
    if (is404Error(error)) {
      return null;
    }

    throw error;
  }
}

function getStandingsEndpoint(season: string | undefined, standingsType: 'drivers' | 'constructors'): string {
  const normalizedSeason = season?.trim();

  if (normalizedSeason) {
    return `/${encodeURIComponent(normalizedSeason)}/${standingsType}-championship`;
  }

  return `/current/${standingsType}-championship`;
}

export async function getDriverStandings(season?: string): Promise<DriverStandingsResponse> {
  const response = await fetchF1Data<ApiDriverChampionshipResponse>(getStandingsEndpoint(season, 'drivers'));
  return mapDriverStandingsResponse(response);
}

export async function getConstructorStandings(season?: string): Promise<ConstructorStandingsResponse> {
  const response = await fetchF1Data<ApiConstructorChampionshipResponse>(getStandingsEndpoint(season, 'constructors'));
  return mapConstructorStandingsResponse(response);
}

export async function getLatestRaceResults(): Promise<RaceResultsResponse> {
  const response = await fetchF1Data<ApiRaceResultsResponse>('/current/last/race');
  return mapRaceResultsResponse(response);
}

export async function getLatestRaceWeekendSessionResults(session: RaceWeekendSessionKey): Promise<RaceWeekendSessionResponse> {
  const endpoint = SESSION_ENDPOINT_BY_KEY[session];
  const response = await fetchF1Data<ApiRaceResultsResponse>(`/current/last/${endpoint}`);
  return mapRaceWeekendSessionResultsResponse(response, session);
}
