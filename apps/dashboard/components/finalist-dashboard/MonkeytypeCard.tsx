import React from 'react';
import { NeoButton } from '../neo-ui/NeoButton';
import { neoColors } from '../neo-ui/theme';
import {
  ButtonRow,
  Card,
  CardHeader,
  CardTitle,
  Divider,
  OtpInline,
  OtpInlineLabel,
  OtpInlineValue,
  SmallMuted,
  ThemeGrid,
  ThemeName,
  ThemeOption,
  ThemeSwatch,
} from './common';

export interface MonkeytypeTheme {
  id: string;
  name: string;
  swatch: string;
}

export interface MonkeytypeCardProps {
  otp: string;
  themes: MonkeytypeTheme[];
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export function MonkeytypeCard(props: MonkeytypeCardProps) {
  return (
    <Card accent={neoColors.accent.red}>
      <CardHeader>
        <CardTitle>Monkeytype</CardTitle>
      </CardHeader>

      <OtpInline>
        <div>
          <OtpInlineLabel>Monkeytype Duel OTP</OtpInlineLabel>
          <OtpInlineValue>{props.otp}</OtpInlineValue>
        </div>
        <ButtonRow>
          <NeoButton
            variant="secondary"
            onClick={() => alert('Copy coming soon')}
          >
            Copy
          </NeoButton>
          <NeoButton
            variant="secondary"
            onClick={() => alert('Reset OTP coming soon')}
          >
            Reset
          </NeoButton>
        </ButtonRow>
      </OtpInline>

      <Divider />

      <CardHeader style={{ gap: '0.25rem' }}>
        <CardTitle style={{ fontSize: '1.05rem' }}>Theme</CardTitle>
      </CardHeader>

      <ThemeGrid>
        {props.themes.map((t) => {
          const selected = props.selectedThemeId === t.id;
          return (
            <ThemeOption
              key={t.id}
              type="button"
              onClick={() => props.onSelectTheme(t.id)}
              $selected={selected}
            >
              <ThemeSwatch style={{ background: t.swatch }} />
              <div>
                <ThemeName>{t.name}</ThemeName>
                <SmallMuted>
                  {selected ? 'Selected' : 'Click to select'}
                </SmallMuted>
              </div>
            </ThemeOption>
          );
        })}
      </ThemeGrid>
    </Card>
  );
}

export default MonkeytypeCard;
