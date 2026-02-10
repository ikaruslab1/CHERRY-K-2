export const PRESET_LOGOS = [
  'unam',
  'fesa',
  'caacfmi',
  'farg',
  'fcien',
  'fcua',
  'fing',
  'iuma',
  'mac',
  'lema',
  'adsem',
  'tecmon'
] as const;

export type PresetLogo = typeof PRESET_LOGOS[number];
