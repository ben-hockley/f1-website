const COUNTRY_TO_FLAG_CODE: Record<string, string> = {
  argentina: 'ar',
  australia: 'au',
  austria: 'at',
  azerbaijan: 'az',
  bahrain: 'bh',
  belgium: 'be',
  brazil: 'br',
  canada: 'ca',
  china: 'cn',
  france: 'fr',
  germany: 'de',
  hungary: 'hu',
  italy: 'it',
  japan: 'jp',
  mexico: 'mx',
  monaco: 'mc',
  netherlands: 'nl',
  portugal: 'pt',
  qatar: 'qa',
  'saudi arabia': 'sa',
  singapore: 'sg',
  spain: 'es',
  thailand: 'th',
  turkey: 'tr',
  'united arab emirates': 'ae',
  'united kingdom': 'gb',
  'great britain': 'gb',
  'united states': 'us',
  usa: 'us',
};

export function getFlagCodeFromCountry(country: string): string | null {
  const normalized = country.trim().toLowerCase();
  return COUNTRY_TO_FLAG_CODE[normalized] ?? null;
}