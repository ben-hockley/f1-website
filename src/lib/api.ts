import {
  ConstructorDirectoryEntry,
  ConstructorLineupData,
  ConstructorLineupDriver,
  ConstructorProfile,
  ConstructorSeasonSummary,
  ConstructorStandingsResponse,
  DriverCurrentSeasonData,
  DriverDirectoryEntry,
  DriverProfile,
  DriverSeasonResultRow,
  DriverStandingsResponse,
  RaceResultsResponse,
} from './types';

const API_BASE_URL = (process.env.F1_API_BASE_URL ?? 'https://f1api.dev/api').replace(/\/+$/, '');
const DIRECTORY_PAGE_LIMIT = 100;
const MAX_DIRECTORY_PAGES = 40;
const DIRECTORY_REVALIDATE_SECONDS = 60 * 60 * 6;

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

interface ApiRaceResultItem {
  position: string | number;
  points: string | number;
  grid?: string | number;
  time?: string;
  fastLap?: string;
  retired?: string | null;
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
    nationality?: string;
    country?: string;
  };
}

interface ApiRaceItem {
  round?: string | number;
  date?: string;
  raceName?: string;
  circuit?: {
    circuitId?: string;
    circuitName?: string;
    country?: string;
    city?: string;
  };
  results?: ApiRaceResultItem | ApiRaceResultItem[];
}

interface ApiRaceResultsResponse {
  season?: string | number;
  races?: ApiRaceItem | ApiRaceItem[];
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

function mapRaceResultsResponse(data: ApiRaceResultsResponse): RaceResultsResponse {
  const race = toArray(data.races)[0];

  if (!race) {
    throw new Error('No race data returned from API.');
  }

  const results = toArray(race.results);

  return {
    season: toText(data.season),
    round: toText(race?.round),
    Race: {
      raceName: race?.raceName ?? '',
      date: race?.date ?? '',
      Circuit: {
        circuitId: race?.circuit?.circuitId ?? '',
        circuitName: race?.circuit?.circuitName ?? '',
        Location: {
          country: race?.circuit?.country ?? '',
          locality: race?.circuit?.city ?? '',
        },
      },
      Results: results.map((result) => ({
        position: toText(result.position),
        points: toText(result.points),
        Driver: {
          driverId: result.driver?.driverId ?? '',
          code: result.driver?.shortName ?? '',
          givenName: result.driver?.name ?? '',
          familyName: result.driver?.surname ?? '',
          nationality: result.driver?.nationality ?? '',
        },
        Constructor: {
          constructorId: result.team?.teamId ?? '',
          name: result.team?.teamName ?? '',
          nationality: result.team?.nationality ?? result.team?.country ?? '',
        },
        grid: toText(result.grid),
        laps: '',
        status: result.retired ? String(result.retired) : 'Finished',
        Time: result.time ? { millis: '', time: result.time } : undefined,
        FastestLap: result.fastLap
          ? {
              rank: '',
              lap: '',
              Time: { time: result.fastLap },
            }
          : undefined,
      })),
    },
  };
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

export async function getDriverStandings(): Promise<DriverStandingsResponse> {
  const response = await fetchF1Data<ApiDriverChampionshipResponse>('/current/drivers-championship');
  return mapDriverStandingsResponse(response);
}

export async function getConstructorStandings(): Promise<ConstructorStandingsResponse> {
  const response = await fetchF1Data<ApiConstructorChampionshipResponse>('/current/constructors-championship');
  return mapConstructorStandingsResponse(response);
}

export async function getLatestRaceResults(): Promise<RaceResultsResponse> {
  const response = await fetchF1Data<ApiRaceResultsResponse>('/current/last/race');
  return mapRaceResultsResponse(response);
}
