import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

interface ThemeToggleSwitchProps {
  showLabel?: boolean;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({ showLabel = false }) => {
  const { isDark, toggleTheme, colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.primaryLight,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={18}
        color={isDark ? '#FBBF24' : '#4F46E5'}
      />
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
