export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructor: Constructor;
}

export interface DriverStandingsResponse {
  season: string;
  round: string;
  DriverStandings: DriverStanding[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface ConstructorStandingsResponse {
  season: string;
  round: string;
  ConstructorStandings: ConstructorStanding[];
}

export interface RaceResult {
  position: string;
  points: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
  };
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: {
    country: string;
    locality: string;
  };
}

export interface Race {
  raceName: string;
  date: string;
  Circuit: Circuit;
  Results: RaceResult[];
}

export interface RaceResultsResponse {
  season: string;
  round: string;
  Race: Race;
}

export interface DriverDirectoryEntry {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
}

export interface ConstructorDirectoryEntry {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverProfile {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  url: string;
}

export interface ConstructorProfile {
  constructorId: string;
  name: string;
  nationality: string;
  firstAppearance: string;
  constructorsChampionships: string;
  driversChampionships: string;
  url: string;
}

export interface DriverSeasonResultRow {
  round: string;
  raceName: string;
  date: string;
  circuitName: string;
  circuitCountry: string;
  circuitCity: string;
  finishingPosition: string;
  gridPosition: string;
  raceTime: string;
  points: string;
  sprintFinishingPosition: string;
  sprintPoints: string;
  sprintRaceTime: string;
}

export interface DriverSeasonSummary {
  races: string;
  points: string;
  wins: string;
  podiums: string;
  bestFinish: string;
}

export interface DriverCurrentSeasonData {
  season: string;
  championshipId: string;
  team: ConstructorProfile;
  summary: DriverSeasonSummary;
  results: DriverSeasonResultRow[];
}

export interface ConstructorSeasonSummary {
  season: string;
  championshipId: string;
  constructor: ConstructorProfile;
  points: string;
  position: string;
  wins: string;
}

export interface ConstructorLineupDriver {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth: string;
  permanentNumber: string;
  code: string;
  url: string;
  points: string;
  position: string;
  wins: string;
}

export interface ConstructorLineupData {
  season: string;
  constructorId: string;
  teamName: string;
  points: string;
  position: string;
  wins: string;
  drivers: ConstructorLineupDriver[];
}
