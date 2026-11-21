import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutUser } from '../store/slices/authSlice';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ title, subtitle }) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out of your session?');
      if (confirmed) {
        dispatch(logoutUser());
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  };

  const isTeacher = user?.role === 'TEACHER';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {user?.role && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isTeacher ? colors.badge : colors.primaryLight,
                  borderColor: isTeacher ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: isTeacher ? colors.badgeText : colors.primary },
                ]}
              >
                {user.role}
              </Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightCol}>
        <ThemeToggleSwitch />
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: colors.surfaceElevated }]}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
