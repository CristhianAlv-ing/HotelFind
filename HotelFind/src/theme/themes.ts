import { colors } from '../theme/colors';

export const lightTheme = {
  background: colors.pureWhite,
  text: colors.darkGray,
  secondaryText: '#999',
  border: '#E0E0E0',
  inputBackground: '#F5F5F5',
  card: colors.pureWhite,
  shadow: colors.darkGray,
};

export const darkTheme = {
  background: '#1A1A1A',
  text: colors.pureWhite,
  secondaryText: '#BBB',
  border: '#333',
  inputBackground: '#2A2A2A',
  card: '#242424',
  shadow: '#000',
};

export type ThemeType = typeof lightTheme;