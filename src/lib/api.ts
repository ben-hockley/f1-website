import { DriverStandingsResponse, ConstructorStandingsResponse, RaceResultsResponse } from './types';

const API_BASE_URL = (process.env.F1_API_BASE_URL ?? 'https://f1api.dev/api').replace(/\/+$/, '');

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

function toText(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
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

async function fetchF1Data<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 300 },
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
