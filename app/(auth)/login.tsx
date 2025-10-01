import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { login } from '@/state/slices/authSlice';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, useColorScheme } from 'react-native';

export default function LoginScreen() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const colorScheme = useColorScheme() ?? 'light';

  const handleLogin = async () => {
    console.log('handleLogin called');
    if (!userName || !password) {
      Alert.alert('Validation Error', 'Username and password are required.');
      return;
    }
    console.log('Dispatching login action with:', { userName, password });
    const resultAction = await dispatch(login({ userName, password }));
    console.log('Login action result:', resultAction);

    if (login.fulfilled.match(resultAction)) {
      console.log('Login fulfilled');
      router.replace('/(tabs)');
    } else {
      console.log('Login rejected');
      let errorMessage = 'An unknown error occurred';
      if (resultAction.payload) {
          console.log('Error payload:', resultAction.payload);
          if (typeof resultAction.payload === 'object' && resultAction.payload !== null && 'message' in resultAction.payload) {
              errorMessage = (resultAction.payload as { message: string }).message;
          } else if (typeof resultAction.payload === 'string') {
              errorMessage = resultAction.payload;
          }
      }
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    input: {
      width: '100%',
      height: 40,
      borderColor: Colors[colorScheme].icon,
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Login</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={Colors[colorScheme].icon}
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors[colorScheme].icon}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {status === 'loading' ? (
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      ) : (
        <Button title="Login" onPress={handleLogin} color={Colors[colorScheme].tint} />
      )}
    </ThemedView>
  );
}
