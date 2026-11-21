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
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ThemeToggleSwitch } from '../components/ThemeToggleSwitch';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email format';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    dispatch(clearAuthError());
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const fillDemo = (role: 'TEACHER' | 'STUDENT') => {
    if (role === 'TEACHER') {
      setEmail('teacher@school.com');
      setPassword('Password123!');
    } else {
      setEmail('hermione@school.com');
      setPassword('Password123!');
    }
    setFieldErrors({});
    dispatch(clearAuthError());
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.logoBrand, { color: colors.primary }]}>EduLeader</Text>
        <ThemeToggleSwitch />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="school" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to your Student Management portal
              </Text>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#451A1A' : '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={[styles.errorBoxText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

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
              placeholder="••••••••"
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
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={{ marginTop: 8 }}
            />

            {/* Quick Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={[styles.demoTitle, { color: colors.textMuted }]}>
                One-Click Demo Accounts:
              </Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  onPress={() => fillDemo('TEACHER')}
                  style={[styles.demoChip, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                >
                  <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                  <Text style={[styles.demoChipText, { color: colors.text }]}>Teacher Demo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => fillDemo('STUDENT')}
                  style={[styles.demoChip, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                >
                  <Ionicons name="school-outline" size={16} color={colors.accent} />
                  <Text style={[styles.demoChipText, { color: colors.text }]}>Student Demo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Switch to Register */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: colors.primary }]}>Register here</Text>
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
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  logoBrand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
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
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
  demoSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#33415522',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
