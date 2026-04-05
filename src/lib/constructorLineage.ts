const CONSTRUCTOR_LINEAGE_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ['rb', 'alphatauri', 'toro_rosso', 'minardi'],
  ['red_bull', 'jaguar', 'stewart'],
  ['alpine', 'renault', 'lotus_f1'],
  ['aston_martin', 'racing_point', 'force_india', 'spyker', 'midland', 'jordan'],
  ['mercedes', 'brawn', 'honda', 'bar'],
  ['sauber', 'alfa_romeo', 'bmw_sauber', 'stake', 'kick_sauber'],
];

function normalizeId(value: string): string {
  return value.trim().toLowerCase();
}

export function getConstructorLineageIds(constructorId: string): string[] {
  const normalized = normalizeId(constructorId);

  if (!normalized) {
    return [];
  }

  const matchingGroup = CONSTRUCTOR_LINEAGE_GROUPS.find((group) => group.includes(normalized));
  if (!matchingGroup) {
    return [normalized];
  }

  const ids = new Set<string>([normalized]);
  for (const id of matchingGroup) {
    ids.add(normalizeId(id));
  }

  return Array.from(ids);
}
