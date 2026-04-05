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

export interface DriverHistoricalSeasonRow {
  season: string;
  position: string;
  points: string;
  wins: string;
  constructor: Constructor;
}

export interface DriverHistoricalResults {
  driverId: string;
  seasons: DriverHistoricalSeasonRow[];
}

export interface ConstructorHistoricalDriver {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
  points: string;
  position: string;
  wins: string;
}

export interface ConstructorHistoricalSeasonRow {
  season: string;
  constructorId: string;
  constructorName: string;
  position: string;
  points: string;
  wins: string;
  drivers: ConstructorHistoricalDriver[];
}

export interface ConstructorHistoricalResults {
  constructorId: string;
  lineageConstructorIds: string[];
  seasons: ConstructorHistoricalSeasonRow[];
  previousConstructorNames: string[];
}

export type RaceWeekendSessionKey =
  | 'race'
  | 'fp1'
  | 'fp2'
  | 'fp3'
  | 'qualy'
  | 'sprint-qualy'
  | 'sprint-race';

export type RaceWeekendSessionAvailability = Record<RaceWeekendSessionKey, boolean>;

export interface RaceWeekendSessionResult {
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
  time: string;
  q1: string;
  q2: string;
  q3: string;
}

export interface RaceWeekendSessionResponse {
  season: string;
  round: string;
  session: RaceWeekendSessionKey;
  raceName: string;
  date: string;
  Circuit: Circuit;
  Results: RaceWeekendSessionResult[];
}

export interface RaceCalendarItem {
  round: string;
  raceName: string;
  date: string;
  circuitName: string;
  circuitCountry: string;
  circuitCity: string;
  hasResults: boolean;
  sessionAvailability: RaceWeekendSessionAvailability;
  hasSprint: boolean;
}

export interface RaceCalendarResponse {
  season: string;
  races: RaceCalendarItem[];
  currentRound: string;
  latestCompletedRound: string;
}
