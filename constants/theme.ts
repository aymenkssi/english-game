export const colors = {
  background: '#FFF7E8',
  surface: '#FFFFFF',
  text: '#2A2342',
  muted: '#6B6485',
  border: '#E9DFCC',
  good: '#23A55A',
  goodSoft: '#DBF5E5',
  bad: '#E5484D',
  badSoft: '#FDE3E4',
  star: '#FFB400',
  starOff: '#DCD3C0',
  disabled: '#D8D0C0',
  disabledDark: '#BDB5A4',
  notice: '#FFF1C2',
  link: '#1B66BD',
  white: '#FFFFFF',
};

export type Accent = { accent: string; dark: string; soft: string };

/** Une couleur par cycle : maternelle, cycle 2, cycle 3, cycle 4. */
export const cycleColors: Accent[] = [
  { accent: '#FF8A3D', dark: '#D96A1F', soft: '#FFE7D3' },
  { accent: '#1FAE6B', dark: '#14864F', soft: '#D9F5E6' },
  { accent: '#2E86E6', dark: '#1B66BD', soft: '#DCEBFD' },
  { accent: '#8757F0', dark: '#6638CF', soft: '#E9E0FD' },
];

export const fonts = {
  head: 'Fredoka_600SemiBold',
  headBold: 'Fredoka_700Bold',
  body: 'Nunito_500Medium',
  bodyBold: 'Nunito_700Bold',
};

export const radius = 20;
