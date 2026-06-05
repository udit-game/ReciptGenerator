import { Stack} from 'expo-router';
import { useColorScheme } from 'react-native';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Theme } from '@/constants/Colors';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '@/database/setup';
import { DB_NAME } from '@/database/engine';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const currentTheme = Theme[colorScheme as keyof typeof Theme];

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: currentTheme.brand,
      background: currentTheme.background,
      card: currentTheme.card,
      text: currentTheme.text,
      border: currentTheme.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <SQLiteProvider 
        databaseName={DB_NAME} 
        onInit={initializeDatabase}
        useSuspense={false}
      >
      <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </ThemeProvider>
  );
}