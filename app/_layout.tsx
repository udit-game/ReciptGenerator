import { Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from '@/database/setup';
import { DB_NAME } from '@/database/engine';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProviderWrapper, useAppTheme } from '@/hooks/Context/ThemeContext';
import { useErrorLog } from '@/hooks/RepoHooks/useErrorLog';
import { useEffect } from 'react';
import { LayoutAnimationType } from 'react-native';


// 1. Declare the Hermes internal type definitions so the compiler compiles cleanly
declare const HermesInternal: {
  hasPromise?: () => boolean;
  enablePromiseRejectionTracker?: (options: {
    allRejections: boolean;
    onUnhandled: (id: number, error: any) => void;
    onHandled: (id: number) => void;
  }) => void;
} | undefined;

function GlobalErrorWatcher({ children }: { children: React.ReactNode }) {
  const { recordError } = useErrorLog();

  useEffect(() => {
    // 2. Capture standard synchronous runtime engine crashes
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler(async (error, isFatal) => {
      await recordError(error);
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // 3. Intercept Unhandled Promises across different engines
    let isTrackingWired = false;

    // Route A: Wire native Hermes engine hooks (Modern Expo Apps Default)
    if (typeof HermesInternal !== 'undefined' && HermesInternal?.enablePromiseRejectionTracker) {
      try {
        HermesInternal.enablePromiseRejectionTracker({
          allRejections: true,
          onUnhandled: async (id, error) => {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            await recordError(normalizedError);
          },
          onHandled: () => {}
        });
        isTrackingWired = true;
      } catch (e) {
        console.warn("Failed to mount Hermes native rejection tracker hook:", e);
      }
    }

    // Route B: Wire JavaScriptCore (JSC) fallback engines
    if (!isTrackingWired) {
      try {
        const rejectionTracking = require("promise/setimmediate/rejection-tracking");
        if (rejectionTracking && rejectionTracking.enable) {
          rejectionTracking.enable({
            allRejections: true,
            onUnhandled: async (_id: LayoutAnimationType, error: any) => {
              const normalizedError = error instanceof Error ? error : new Error(String(error));
              await recordError(normalizedError);
            },
            onHandled: () => {},
          });
          isTrackingWired = true;
        }
      } catch (fallbackError) {
        // Core tracking module missing or not resolvable
      }
    }

    // Route C: Wire standard Web preview browser environments
    
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleWebRejection = async (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        await recordError(error);
      };
      window.addEventListener('unhandledrejection', handleWebRejection);
      
      return () => {
        if (originalHandler) ErrorUtils.setGlobalHandler(originalHandler);
        window.removeEventListener('unhandledrejection', handleWebRejection);
      };
    }

    return () => {
      if (originalHandler) {
        ErrorUtils.setGlobalHandler(originalHandler);
      }
    };
  }, [recordError]);

  return <>{children}</>;
}

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
        <GlobalErrorWatcher>
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
        </GlobalErrorWatcher>
      </SQLiteProvider>
    </ThemeProvider>
  );
}