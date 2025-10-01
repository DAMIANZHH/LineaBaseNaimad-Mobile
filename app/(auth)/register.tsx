import { UserCreateDtoInput } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { register } from '@/state/slices/authSlice';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, TextInput, useColorScheme } from 'react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState<UserCreateDtoInput>({
    userName: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    email: '',
    document: '',
    address: '',
  });
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const colorScheme = useColorScheme() ?? 'light';

  const handleInputChange = (field: keyof UserCreateDtoInput, value: string) => {
    setFormData(prevState => ({ ...prevState, [field]: value }));
  };

  const handleRegister = async () => {
    const { userName, password, passwordConfirm, firstName, lastName, email, document, address } = formData;
    if (!userName || !password || !passwordConfirm || !firstName || !lastName || !email || !document || !address) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    const resultAction = await dispatch(register(formData));
    if (register.fulfilled.match(resultAction)) {
      Alert.alert('Registration Successful', 'You can now log in.');
      router.replace('/(auth)/login');
    } else {
      let errorMessage = 'An unknown error occurred';
      if (resultAction.payload) {
          if (typeof resultAction.payload === 'object' && resultAction.payload !== null && 'message' in resultAction.payload) {
              errorMessage = (resultAction.payload as { message: string }).message;
          } else if (typeof resultAction.payload === 'string') {
              errorMessage = resultAction.payload;
          }
      }
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    scrollContainer: {
      alignItems: 'center',
      justifyContent: 'center',
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title">Register</ThemedText>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor={Colors[colorScheme].icon} value={formData.userName} onChangeText={(value) => handleInputChange('userName', value)} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor={Colors[colorScheme].icon} value={formData.firstName} onChangeText={(value) => handleInputChange('firstName', value)} />
        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor={Colors[colorScheme].icon} value={formData.lastName} onChangeText={(value) => handleInputChange('lastName', value)} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors[colorScheme].icon} value={formData.email} onChangeText={(value) => handleInputChange('email', value)} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Document" placeholderTextColor={Colors[colorScheme].icon} value={formData.document} onChangeText={(value) => handleInputChange('document', value)} />
        <TextInput style={styles.input} placeholder="Address" placeholderTextColor={Colors[colorScheme].icon} value={formData.address} onChangeText={(value) => handleInputChange('address', value)} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor={Colors[colorScheme].icon} value={formData.password} onChangeText={(value) => handleInputChange('password', value)} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={Colors[colorScheme].icon} value={formData.passwordConfirm} onChangeText={(value) => handleInputChange('passwordConfirm', value)} secureTextEntry />
        
        {status === 'loading' ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        ) : (
          <Button title="Register" onPress={handleRegister} color={Colors[colorScheme].tint} />
        )}
      </ScrollView>
    </ThemedView>
  );
}
