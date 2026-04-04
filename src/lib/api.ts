import { DriverStandingsResponse, ConstructorStandingsResponse, RaceResultsResponse } from './types';

const API_BASE_URL = 'https://api.f1api.dev';

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
  return fetchF1Data<DriverStandingsResponse>('/current/drivers-standings');
}

export async function getConstructorStandings(): Promise<ConstructorStandingsResponse> {
  return fetchF1Data<ConstructorStandingsResponse>('/current/constructors-standings');
}

export async function getLatestRaceResults(): Promise<RaceResultsResponse> {
  return fetchF1Data<RaceResultsResponse>('/current/last/race');
}
