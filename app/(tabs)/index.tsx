import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Counter } from '@/components/Counter';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ThemedButton';
import { useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/state/slices/authSlice';
import { router } from 'expo-router';

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/(auth)/login');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <Counter />
      <ThemedButton title="Cerrar Sesión" onPress={handleLogout} style={styles.logoutButton} />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  logoutButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
