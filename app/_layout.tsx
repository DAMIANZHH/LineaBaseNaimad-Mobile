import '@/api/axiosInterceptors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setToken } from '@/state/slices/authSlice';
import { RootState, store } from '@/state/store';
import { storage } from '@/utils/storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const segments = useSegments();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await storage.getItem('token');
        const refreshToken = await storage.getItem('refreshToken');
        if (token && refreshToken) {
          store.dispatch(setToken({ token, refreshToken }));
        }
      } catch (e) {
        // Restoring token failed
      } finally {
        setTokenLoaded(true);
      }
    };

    checkToken();
  }, []);

  useEffect(() => {
    if (!tokenLoaded || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    SplashScreen.hideAsync();
  }, [isAuthenticated, tokenLoaded, navigationState?.key]);

  if (!tokenLoaded || !navigationState?.key) {
    return null; // or a loading spinner
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  SplashScreen.preventAutoHideAsync();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </Provider>
  );
}
