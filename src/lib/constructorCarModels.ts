export interface ConstructorCarModelConfig {
  modelPath: string | null;
  accentColor: string;
}

const DEFAULT_ACCENT_COLOR = '#E2E8F0';

// Credit for all the 3d Models by Abu Saif is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
const CONSTRUCTOR_MODEL_PATHS: Record<string, string> = {
  alpine: '/constructor-models/f1-2025_alpine_a525.glb',
  mclaren: '/constructor-models/f1-2025_mclaren_mcl39.glb',
  ferrari: '/constructor-models/ferrari_sf-25.glb',
  aston_martin: '/constructor-models/Aston Martin Aramco AMR25.glb',
  red_bull: '/constructor-models/F1-2025 RedBull RB21.glb'
};

const CONSTRUCTOR_ACCENT_COLORS: Record<string, string> = {
  alpine: '#2D7BFF',
  aston_martin: '#0A5C4D',
  audi: '#C3151C',
  cadillac: '#2A58B7',
  ferrari: '#DC0000',
  haas: '#9EA0A1',
  mclaren: '#FF8000',
  mercedes: '#00D2BE',
  rb: '#6692FF',
  red_bull: '#1E5BC6',
  williams: '#005AFF',
};

function getConstructorModelPath(constructorId: string): string | null {
  const normalizedId = constructorId.trim().toLowerCase();
  const modelPath = CONSTRUCTOR_MODEL_PATHS[normalizedId];

  if (!modelPath) {
    return null;
  }

  const normalizedPath = modelPath.trim().toLowerCase();
  const isGlbModel = normalizedPath.endsWith('.glb') || normalizedPath.endsWith('.gltf');

  return isGlbModel ? modelPath : null;
}

export function hasConstructorCarModel(constructorId: string): boolean {
  return getConstructorModelPath(constructorId) !== null;
}

export function getConstructorCarModelConfig(constructorId: string): ConstructorCarModelConfig {
  const normalizedId = constructorId.trim().toLowerCase();

  return {
    modelPath: getConstructorModelPath(constructorId),
    accentColor: CONSTRUCTOR_ACCENT_COLORS[normalizedId] ?? DEFAULT_ACCENT_COLOR,
  };
}
