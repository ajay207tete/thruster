import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

const Colors: Record<ColorScheme, Record<string, string>> = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2f95dc',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#fff',
  },
};

/**
 * Hook to get theme-aware colors
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme as ColorScheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme as ColorScheme][colorName];
  }
}
