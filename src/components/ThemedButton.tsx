import { Colors } from '@/constants/theme';
import React from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';

interface ThemedButtonProps {
  onPress: () => void;
  title?: string;
  style?: object;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function ThemedButton({ onPress, title, style, disabled = false, children }: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const buttonColor = disabled ? Colors[colorScheme].tabIconDefault : Colors[colorScheme].tint;
  const textColor = Colors[colorScheme].background; // Assuming text should contrast with button color

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.button,
      { backgroundColor: buttonColor },
      style,
      pressed && { opacity: 0.8 },
    ]} disabled={disabled}>
      {children ? children : <ThemedText style={[styles.text, { color: textColor }]}>{title}</ThemedText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
