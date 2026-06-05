import { Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '@/database/setup';
import { DB_NAME } from '@/database/engine';
import ThemeToggle from '@/components/ThemeToggle'; // Adjust path to your toggle file
import { ThemeProviderWrapper, useAppTheme } from '@/hooks/Context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProviderWrapper>
      <InnerRootLayout />
    </ThemeProviderWrapper>
  );
}

function InnerRootLayout() {
  const { currentTheme } = useAppTheme();

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
        {/* Configure the master header layout settings directly on the Stack */}
        <Stack
          screenOptions={{
            headerShown: true, // Turn header on globally for the active layouts
            headerStyle: { backgroundColor: currentTheme.card },
            headerTintColor: currentTheme.text,
            headerShadowVisible: true,
          }}
        >
          {/* Target the tabs group specifically and mount the toggle into its top bar slot */}
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              title: "Receipt Generator",
              headerRight: () => <ThemeToggle /> 
            }} 
          />
        </Stack>
      </SQLiteProvider>
    </ThemeProvider>
  );
}