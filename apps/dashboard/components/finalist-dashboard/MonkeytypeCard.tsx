import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowRotateRight, FaChevronDown } from 'react-icons/fa6';
import styled from 'styled-components';
import { neoBorders, neoColors, neoShadows } from '../neo-ui/theme';
import {
  ButtonRow,
  Card,
  OtpInline,
  OtpInlineLabel,
  OtpInlineValue,
} from './common';
import { MONKEYTYPE_THEMES, MonkeytypeTheme } from './monkeytype-themes';

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb01(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim();
  if (!normalized.startsWith('#')) return null;
  const raw = normalized.slice(1);
  const expanded =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (expanded.length !== 6) return null;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function rgb01ToHsl(rgb: { r: number; g: number; b: number }) {
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function hexToRgba(hex: string, alpha: number) {
  const rgb = hexToRgb01(hex);
  if (!rgb) return hex;
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Creates a "muted surface" from the theme bg by desaturating and nudging lightness.
 * This helps keep OTP + Theme controls consistent across very light and very dark themes.
 */
function mutedSurfaceFromBg(bgHex: string) {
  const rgb = hexToRgb01(bgHex);
  if (!rgb) return bgHex;
  const { h, s, l } = rgb01ToHsl(rgb);

  // Desaturate heavily (towards neutral UI surfaces).
  const nextS = clamp01(s * 0.18);
  // Lift lightness towards a readable "panel" surface (but don't blow out whites).
  const nextL = clamp01(l + (1 - l) * 0.35);

  const sPct = Math.round(nextS * 100);
  const lPct = Math.round(nextL * 100);
  return `hsl(${Math.round(h)}, ${sPct}%, ${lPct}%)`;
}

export interface MonkeytypeCardProps {
  themes?: MonkeytypeTheme[];
}

export function MonkeytypeCard(props: MonkeytypeCardProps) {
  const themes = useMemo(
    () => props.themes ?? MONKEYTYPE_THEMES,
    [props.themes]
  );
  const themeById = useMemo(
    () => new Map<string, MonkeytypeTheme>(themes.map((t) => [t.id, t])),
    [themes]
  );

  const [otp, setOtp] = useState<string>('—');
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    props.themes?.[0]?.id ?? MONKEYTYPE_THEMES[0].id
  );
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [themeQuery, setThemeQuery] = useState('');

  const selectedTheme = useMemo(() => {
    const fromList = themeById.get(selectedThemeId);
    return fromList ?? themes[0];
  }, [selectedThemeId, themeById, themes]);

  const filteredThemes = useMemo(() => {
    const q = themeQuery.trim().toLowerCase();
    if (!q) return themes;
    return themes.filter((t) => `${t.name} ${t.id}`.toLowerCase().includes(q));
  }, [themeQuery, themes]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/monkeytype-duel/settings', {
          method: 'GET',
        });
        if (!res.ok) return;
        const body = (await res.json()) as
          | { message: string }
          | { settings: unknown; otp?: string | null };

        if (!('settings' in body)) return;
        const nextSettings =
          body.settings &&
          typeof body.settings === 'object' &&
          !Array.isArray(body.settings)
            ? (body.settings as Record<string, unknown>)
            : {};
        setSettings(nextSettings);

        const themeId = nextSettings.themeId;
        if (typeof themeId === 'string' && themeId.length > 0) {
          setSelectedThemeId(themeById.has(themeId) ? themeId : themes[0].id);
        }

        const nextOtp = body.otp;
        if (typeof nextOtp === 'string' && nextOtp.length > 0) {
          setOtp(nextOtp);
        }
      } catch {
        // ignore
      }
    };
    run();
  }, [themeById, themes]);

  const persistTheme = async (themeId: string) => {
    const next = { ...settings, themeId };
    setSettings(next);
    setSelectedThemeId(themeId);
    setThemeMenuOpen(false);
    setThemeQuery('');
    try {
      const res = await fetch('/api/monkeytype-duel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: next }),
      });
      if (!res.ok) return;
      const body = (await res.json()) as
        | { message: string }
        | { settings: unknown; otp?: string | null };
      if (!('settings' in body)) return;
      const nextSettings =
        body.settings &&
        typeof body.settings === 'object' &&
        !Array.isArray(body.settings)
          ? (body.settings as Record<string, unknown>)
          : {};
      setSettings(nextSettings);
      const nextOtp = body.otp;
      if (typeof nextOtp === 'string' && nextOtp.length > 0) {
        setOtp(nextOtp);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setThemeMenuOpen(false);
    };
    if (!themeMenuOpen) return;
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [themeMenuOpen]);

  return (
    <ThemedCard accent={selectedTheme.subColor} $theme={selectedTheme}>
      {/* <TopStripe aria-hidden="true" $color={selectedTheme.subColor} /> */}
      <TopRow>
        <MonkeytypeTitle $theme={selectedTheme} />
      </TopRow>

      <Row>
        <ThemedOtpInline>
          <div>
            <OtpInlineLabel style={{ color: selectedTheme.subColor }}>
              OTP
            </OtpInlineLabel>
            <OtpInlineValue style={{ color: selectedTheme.mainColor }}>
              {otp}
            </OtpInlineValue>
          </div>
        </ThemedOtpInline>

        <ThemePicker
          $open={themeMenuOpen}
          themeId={selectedThemeId}
          themeName={selectedTheme.name}
          query={themeQuery}
          themes={filteredThemes}
          total={themes.length}
          onToggle={() => setThemeMenuOpen((v) => !v)}
          onClose={() => setThemeMenuOpen(false)}
          onQueryChange={setThemeQuery}
          onSelect={persistTheme}
          theme={selectedTheme}
        />
      </Row>
    </ThemedCard>
  );
}

const ThemedCard = styled(Card)<{ $theme: MonkeytypeTheme }>`
  --mt-main: ${({ $theme }) => $theme.mainColor};
  --mt-sub: ${({ $theme }) => $theme.subColor};
  --mt-control-h: 70px;
  --mt-bg: ${({ $theme }) => $theme.bgColor};
  --mt-text: ${({ $theme }) => $theme.textColor};
  --mt-textMuted: ${({ $theme }) => hexToRgba($theme.textColor, 0.7)};
  --mt-surface: ${({ $theme }) => mutedSurfaceFromBg($theme.bgColor)};
  background-color: ${({ $theme }) => $theme.bgColor};
  position: relative;
  font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, 'Liberation Mono', 'Courier New', monospace;
`;

function MonkeytypeTitle(props: { $theme: MonkeytypeTheme }) {
  // We intentionally keep this self-contained (no global font changes).
  // Monkeytype's wordmark is close to a geometric sans; Inter is already used across the repo.
  return (
    <WordmarkWrap $color={props.$theme.mainColor}>
      <WordmarkIcon
        style={{ isolation: 'isolate' }}
        viewBox="0 0 300 180"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Normalize exported negative-coordinate SVG into a clean 0-based viewBox. */}
        <g transform="translate(680 1030)">
          <path d="M -430 -910 L -430 -910 C -424.481 -910 -420 -905.519 -420 -900 L -420 -900 C -420 -894.481 -424.481 -890 -430 -890 L -430 -890 C -435.519 -890 -440 -894.481 -440 -900 L -440 -900 C -440 -905.519 -435.519 -910 -430 -910 Z"></path>
          <path d=" M -570 -910 L -510 -910 C -504.481 -910 -500 -905.519 -500 -900 L -500 -900 C -500 -894.481 -504.481 -890 -510 -890 L -570 -890 C -575.519 -890 -580 -894.481 -580 -900 L -580 -900 C -580 -905.519 -575.519 -910 -570 -910 Z "></path>
          <path d="M -590 -970 L -590 -970 C -584.481 -970 -580 -965.519 -580 -960 L -580 -940 C -580 -934.481 -584.481 -930 -590 -930 L -590 -930 C -595.519 -930 -600 -934.481 -600 -940 L -600 -960 C -600 -965.519 -595.519 -970 -590 -970 Z"></path>
          <path d=" M -639.991 -960.515 C -639.72 -976.836 -626.385 -990 -610 -990 L -610 -990 C -602.32 -990 -595.31 -987.108 -590 -982.355 C -584.69 -987.108 -577.68 -990 -570 -990 L -570 -990 C -553.615 -990 -540.28 -976.836 -540.009 -960.515 C -540.001 -960.345 -540 -960.172 -540 -960 L -540 -960 L -540 -940 C -540 -934.481 -544.481 -930 -550 -930 L -550 -930 C -555.519 -930 -560 -934.481 -560 -940 L -560 -960 L -560 -960 C -560 -965.519 -564.481 -970 -570 -970 C -575.519 -970 -580 -965.519 -580 -960 L -580 -960 L -580 -960 L -580 -940 C -580 -934.481 -584.481 -930 -590 -930 L -590 -930 C -595.519 -930 -600 -934.481 -600 -940 L -600 -960 L -600 -960 L -600 -960 L -600 -960 L -600 -960 L -600 -960 L -600 -960 L -600 -960 C -600 -965.519 -604.481 -970 -610 -970 C -615.519 -970 -620 -965.519 -620 -960 L -620 -960 L -620 -940 C -620 -934.481 -624.481 -930 -630 -930 L -630 -930 C -635.519 -930 -640 -934.481 -640 -940 L -640 -960 L -640 -960 C -640 -960.172 -639.996 -960.344 -639.991 -960.515 Z "></path>
          <path d=" M -460 -930 L -460 -900 C -460 -894.481 -464.481 -890 -470 -890 L -470 -890 C -475.519 -890 -480 -894.481 -480 -900 L -480 -930 L -508.82 -930 C -514.99 -930 -520 -934.481 -520 -940 L -520 -940 C -520 -945.519 -514.99 -950 -508.82 -950 L -431.18 -950 C -425.01 -950 -420 -945.519 -420 -940 L -420 -940 C -420 -934.481 -425.01 -930 -431.18 -930 L -460 -930 Z "></path>
          <path d="M -470 -990 L -430 -990 C -424.481 -990 -420 -985.519 -420 -980 L -420 -980 C -420 -974.481 -424.481 -970 -430 -970 L -470 -970 C -475.519 -970 -480 -974.481 -480 -980 L -480 -980 C -480 -985.519 -475.519 -990 -470 -990 Z"></path>
          <path d=" M -630 -910 L -610 -910 C -604.481 -910 -600 -905.519 -600 -900 L -600 -900 C -600 -894.481 -604.481 -890 -610 -890 L -630 -890 C -635.519 -890 -640 -894.481 -640 -900 L -640 -900 C -640 -905.519 -635.519 -910 -630 -910 Z "></path>
          <path d=" M -515 -990 L -510 -990 C -504.481 -990 -500 -985.519 -500 -980 L -500 -980 C -500 -974.481 -504.481 -970 -510 -970 L -515 -970 C -520.519 -970 -525 -974.481 -525 -980 L -525 -980 C -525 -985.519 -520.519 -990 -515 -990 Z "></path>
          <path d=" M -660 -910 L -680 -910 L -680 -980 C -680 -1007.596 -657.596 -1030 -630 -1030 L -430 -1030 C -402.404 -1030 -380 -1007.596 -380 -980 L -380 -900 C -380 -872.404 -402.404 -850 -430 -850 L -630 -850 C -657.596 -850 -680 -872.404 -680 -900 L -680 -920 L -660 -920 L -660 -900 C -660 -883.443 -646.557 -870 -630 -870 L -430 -870 C -413.443 -870 -400 -883.443 -400 -900 L -400 -980 C -400 -996.557 -413.443 -1010 -430 -1010 L -630 -1010 C -646.557 -1010 -660 -996.557 -660 -980 L -660 -910 Z "></path>
        </g>
      </WordmarkIcon>
      <WordmarkText>
        <WordmarkBottom $color={props.$theme.textColor}>
          monkeytype duel
        </WordmarkBottom>
      </WordmarkText>
    </WordmarkWrap>
  );
}

const ThemedOtpInline = styled(OtpInline)`
  height: var(--mt-control-h);
  border: 0;
  background: transparent;
  align-items: center;
  color: var(--mt-text);
  padding: 0.35rem 0;

  ${OtpInlineLabel} {
    color: var(--mt-textMuted);
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.25rem;
`;

const Row = styled.div`
  display: flex;
  align-items: stretch;
  gap: 2.75rem;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TooltipWrap = styled.div`
  position: relative;

  &:hover > div[role='tooltip'],
  &:focus-within > div[role='tooltip'] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: -44px;
  right: 0;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  box-shadow: ${neoShadows.small};
  padding: 0.35rem 0.55rem;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  transition: opacity 0.12s ease, transform 0.12s ease;
  z-index: 30;
`;

const IconButton = styled.button<{ $boxShadowColor: string }>`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  color: ${neoColors.text};
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 3px 3px 0 ${({ $boxShadowColor }) => $boxShadowColor};
  transition: transform 0.08s ease;

  &:hover {
    background: ${neoColors.background};
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 3px solid var(--mt-main);
    outline-offset: 2px;
  }
`;

type ThemePickerProps = {
  $open: boolean;
  themeId: string;
  themeName: string;
  query: string;
  themes: MonkeytypeTheme[];
  total: number;
  theme: MonkeytypeTheme;
  onToggle: () => void;
  onClose: () => void;
  onQueryChange: (v: string) => void;
  onSelect: (id: string) => void;
};

function ThemePicker(props: ThemePickerProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!props.$open) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [props.$open]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        props.onClose();
      }
    };
    if (!props.$open) return;
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [props.$open, props]);

  return (
    <ThemePickerWrap ref={wrapRef}>
      <ThemePickerButton
        type="button"
        onClick={props.onToggle}
        aria-haspopup="listbox"
        aria-expanded={props.$open}
        $boxShadowColor={props.theme.subColor}
      >
        <ThemePickerLeft>
          <OtpInlineLabel style={{ color: props.theme.subColor }}>
            Theme
          </OtpInlineLabel>
          <OtpInlineValue>{props.themeName}</OtpInlineValue>
        </ThemePickerLeft>
        <ThemePickerRight aria-hidden="true">
          <Swatch $size="lg" style={{ background: props.theme.mainColor }} />
          <Swatch $size="lg" style={{ background: props.theme.subColor }} />
          <Swatch $size="lg" style={{ background: props.theme.textColor }} />
          <ChevronWrap>
            <FaChevronDown size={14} aria-hidden="true" />
          </ChevronWrap>
        </ThemePickerRight>
      </ThemePickerButton>

      {props.$open ? (
        <ThemeMenu role="listbox" aria-label="Themes">
          <ThemeSearchRow>
            <ThemeSearch
              ref={inputRef}
              value={props.query}
              placeholder="Search themes…"
              onChange={(e) => props.onQueryChange(e.target.value)}
            />
            <ThemeCount>
              {props.query.trim() ? props.themes.length : props.total}
            </ThemeCount>
          </ThemeSearchRow>

          <ThemeList>
            {props.themes.length === 0 ? (
              <EmptyRow>No matches</EmptyRow>
            ) : (
              props.themes.map((t) => {
                const selected = t.id === props.themeId;
                return (
                  <ThemeItem
                    key={t.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => props.onSelect(t.id)}
                    $selected={selected}
                  >
                    <div>
                      <ThemeItemName>{t.name}</ThemeItemName>
                      <ThemeItemMeta>{t.id}</ThemeItemMeta>
                    </div>
                    <ThemeItemSwatches aria-hidden="true">
                      <Swatch style={{ background: t.mainColor }} />
                      <Swatch style={{ background: t.subColor }} />
                      <Swatch style={{ background: t.textColor }} />
                    </ThemeItemSwatches>
                  </ThemeItem>
                );
              })
            )}
          </ThemeList>
        </ThemeMenu>
      ) : null}
    </ThemePickerWrap>
  );
}

const ThemePickerWrap = styled.div`
  position: relative;
  flex: 1 1 auto;
  min-width: 280px;

  @media (max-width: 520px) {
    min-width: 0;
  }
`;

const ThemePickerButton = styled.button<{ $boxShadowColor: string }>`
  width: 100%;
  height: var(--mt-control-h);
  border: 0;
  background: transparent;
  color: var(--mt-text);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;
  box-shadow: none;

  &:hover {
    opacity: 0.92;
  }

  &:active {
    transform: none;
  }

  &:focus-visible {
    outline: 3px solid var(--mt-main);
    outline-offset: 2px;
  }
`;

const ThemePickerLeft = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0.45rem 0.85rem;
`;

const ThemePickerRight = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 0.45rem 0.85rem;
`;

const ChevronWrap = styled.div`
  margin-left: 6px;
  color: var(--mt-textMuted);
`;

const Swatch = styled.div<{ $size?: 'md' | 'lg' }>`
  width: ${({ $size }) => ($size === 'lg' ? '18px' : '12px')};
  height: ${({ $size }) => ($size === 'lg' ? '18px' : '12px')};
  border: ${neoBorders.standard};
`;

const ThemeMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  box-shadow: ${neoShadows.medium};
  overflow: hidden;
  z-index: 20;
`;

const ThemeSearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border-bottom: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const ThemeSearch = styled.input`
  width: 100%;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  color: ${neoColors.text};
  padding: 0.6rem 0.7rem;
  font: inherit;

  &::placeholder {
    color: ${neoColors.textMuted};
  }

  &:focus {
    outline: 3px solid var(--mt-main);
    outline-offset: 2px;
  }
`;

const ThemeCount = styled.div`
  min-width: 38px;
  text-align: right;
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
`;

const ThemeList = styled.div`
  max-height: 320px;
  overflow: auto;
`;

const ThemeItem = styled.button<{ $selected: boolean }>`
  width: 100%;
  border: 0;
  border-bottom: 2px solid #000;
  background: ${({ $selected }) =>
    $selected ? `${neoColors.accent.yellow}55` : neoColors.surface};
  color: ${neoColors.text};
  padding: 0.65rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${neoColors.accent.yellow}55;
  }

  &:last-child {
    border-bottom: 0;
  }
`;

const ThemeItemName = styled.div`
  font-weight: 800;
  line-height: 1.1;
`;

const ThemeItemMeta = styled.div`
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
  margin-top: 0.15rem;
`;

const ThemeItemSwatches = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
`;

const EmptyRow = styled.div`
  padding: 0.85rem 0.8rem;
  color: ${neoColors.textMuted};
`;

const WordmarkWrap = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: ${({ $color }) => $color};
`;

const WordmarkIcon = styled.svg`
  width: 56px;
  height: 28px;
  flex: 0 0 auto;

  rect {
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 2px;
  }

  path {
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 2.5px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const WordmarkText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;
`;

const WordmarkBottom = styled.div<{ $color: string }>`
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: ${({ $color }) => $color};
  font-family: 'Lexend Deca', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica Neue, Arial, Noto Sans,
    sans-serif;
  line-height: 1;
`;

export default MonkeytypeCard;
