export type MonkeytypeThemeColors = {
  bgColor: string;
  mainColor: string;
  subColor: string;
  textColor: string;
};

export type MonkeytypeTheme = MonkeytypeThemeColors & {
  /** Monkeytype theme key, e.g. `ms_cupcakes` */
  id: string;
  /** Human readable theme name */
  name: string;
};

// Seed list (you'll paste the full Monkeytype theme list later).
export const MONKEYTYPE_THEMES: MonkeytypeTheme[] = [
  {
    id: 'ms_cupcakes',
    name: 'ms cupcakes',
    bgColor: '#ffffff',
    mainColor: '#5ed5f3',
    subColor: '#d64090',
    textColor: '#0a282f',
  },
  {
    id: 'dollar',
    name: 'dollar',
    bgColor: '#e4e4d4',
    mainColor: '#6b886b',
    subColor: '#8a9b69',
    textColor: '#555a56',
  },
  {
    id: 'lime',
    name: 'lime',
    bgColor: '#7c878e',
    mainColor: '#93c247',
    subColor: '#4b5257',
    textColor: '#bfcfdc',
  },
  {
    id: 'sweden',
    name: 'sweden',
    bgColor: '#0058a3',
    mainColor: '#ffcc02',
    subColor: '#57abdb',
    textColor: '#ffffff',
  },
];

export const monkeytypeThemeById = new Map<string, MonkeytypeTheme>(
  MONKEYTYPE_THEMES.map((t) => [t.id, t])
);

export function getMonkeytypeThemeById(
  themeId: string | null | undefined
): MonkeytypeTheme {
  if (typeof themeId === 'string' && themeId.length > 0) {
    const theme = monkeytypeThemeById.get(themeId);
    if (theme) return theme;
  }
  return MONKEYTYPE_THEMES[0];
}
