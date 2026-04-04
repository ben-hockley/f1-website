const NATIONALITY_TO_FLAG_CODE: Record<string, string> = {
  argentina: 'ar',
  australian: 'au',
  australia: 'au',
  brazil: 'br',
  brazilian: 'br',
  canada: 'ca',
  canadian: 'ca',
  finland: 'fi',
  finnish: 'fi',
  france: 'fr',
  french: 'fr',
  germany: 'de',
  german: 'de',
  'great britain': 'gb',
  british: 'gb',
  'united kingdom': 'gb',
  england: 'gb',
  italy: 'it',
  italian: 'it',
  mexico: 'mx',
  mexican: 'mx',
  monaco: 'mc',
  monegasque: 'mc',
  netherlands: 'nl',
  dutch: 'nl',
  'new zealand': 'nz',
  'new zealander': 'nz',
  spain: 'es',
  spanish: 'es',
  thailand: 'th',
  thai: 'th',
};

export function getFlagCodeFromNationality(nationality: string): string | null {
  const normalized = nationality.trim().toLowerCase();
  return NATIONALITY_TO_FLAG_CODE[normalized] ?? null;
}
