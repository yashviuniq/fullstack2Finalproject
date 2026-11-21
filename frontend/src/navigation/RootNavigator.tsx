import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import { restoreSession } from '../store/slices/authSlice';
import { useAppTheme } from '../context/ThemeContext';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isRestoringSession } = useAppSelector((state) => state.auth);
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  if (isRestoringSession) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
