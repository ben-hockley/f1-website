const CONSTRUCTOR_LOGOS: Record<string, string> = {
  alpine: '/constructor-logos/alpine.avif',
  aston_martin: '/constructor-logos/aston_martin.avif',
  audi: '/constructor-logos/audi.avif',
  cadillac: '/constructor-logos/cadillac.avif',
  ferrari: '/constructor-logos/ferrari.avif',
  haas: '/constructor-logos/haas.avif',
  mclaren: '/constructor-logos/mclaren.avif',
  mercedes: '/constructor-logos/mercedes.avif',
  rb: '/constructor-logos/rb.avif',
  red_bull: '/constructor-logos/red_bull.avif',
  williams: '/constructor-logos/williams.avif',
};

const DEFAULT_LOGO = '/constructor-logos/default.avif';

export function getConstructorLogoPath(constructorId: string): string {
  const normalizedId = constructorId.trim().toLowerCase();
  return CONSTRUCTOR_LOGOS[normalizedId] ?? DEFAULT_LOGO;
}
