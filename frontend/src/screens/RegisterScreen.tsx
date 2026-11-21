import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, clearAuthError } from '../store/slices/authSlice';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ThemeToggleSwitch } from '../components/ThemeToggleSwitch';
import { Role } from '../types';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: { fullName?: string; email?: string; password?: string } = {};
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    dispatch(clearAuthError());
    dispatch(
      registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      })
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <ThemeToggleSwitch />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Join the Student Management System
              </Text>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#451A1A' : '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={[styles.errorBoxText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Interactive Role Selector */}
            <View style={styles.roleContainer}>
              <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>Select Your Role</Text>
              <View style={styles.roleTabs}>
                <TouchableOpacity
                  onPress={() => setRole('STUDENT')}
                  style={[
                    styles.roleTab,
                    {
                      backgroundColor: role === 'STUDENT' ? colors.primary : colors.surfaceElevated,
                      borderColor: role === 'STUDENT' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="school"
                    size={18}
                    color={role === 'STUDENT' ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      { color: role === 'STUDENT' ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole('TEACHER')}
                  style={[
                    styles.roleTab,
                    {
                      backgroundColor: role === 'TEACHER' ? colors.primary : colors.surfaceElevated,
                      borderColor: role === 'TEACHER' ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color={role === 'TEACHER' ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleTabText,
                      { color: role === 'TEACHER' ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    Teacher
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.roleHint, { color: colors.textMuted }]}>
                {role === 'STUDENT'
                  ? 'Students can view their rank, track awarded points, and view peer standings.'
                  : 'Teachers can inspect rankings and award or deduct points with audit reasons.'}
              </Text>
            </View>

            <Input
              label="Full Name"
              placeholder="e.g. Albus Dumbledore"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: undefined });
              }}
              error={fieldErrors.fullName}
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
            />

            <Input
              label="Email Address"
              placeholder="e.g. user@school.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
              }}
              error={fieldErrors.password}
              isPassword
              autoCapitalize="none"
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: 8 }}
            />

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorBoxText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  roleContainer: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleHint: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
