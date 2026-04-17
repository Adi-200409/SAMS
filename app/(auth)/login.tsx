import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GradientButton from '../../components/ui/GradientButton';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      let msg = 'Login failed. Check your credentials.';
      if (err?.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err?.message) {
        msg = `Network error: ${err.message}\n\nMake sure your phone and PC are on the same Wi-Fi.`;
      }
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128', '#0D0D22']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={['#6C63FF', '#8B4CF7']} style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </LinearGradient>
            <Text style={styles.appName}>SAMS</Text>
            <Text style={styles.tagline}>Student Activity Management System</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={Colors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <GradientButton
              label="Sign In 🚀"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {/* AI Benefits */}
            <View style={styles.featureRow}>
              {['🤖 AI Recs', '🍅 Pomodoro', '📊 Gamify'].map((f) => (
                <View key={f} style={styles.featureChip}>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Don't have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            <GradientButton
              label="Create Account"
              onPress={() => router.push('/(auth)/register')}
              outline
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.base },
  header: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: Typography['3xl'], fontWeight: Typography.extrabold,
    color: Colors.textPrimary, letterSpacing: 4,
  },
  tagline: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: Colors.glass,
    borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.xl, padding: Spacing.xl,
  },
  title: {
    fontSize: Typography['2xl'], fontWeight: Typography.bold,
    color: Colors.textPrimary, marginBottom: 4,
  },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.base },
  label: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: Typography.medium },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1, color: Colors.textPrimary,
    fontSize: Typography.base, paddingVertical: 13,
  },
  eyeBtn: { padding: 4 },
  loginBtn: { marginTop: Spacing.md, marginBottom: Spacing.base },
  featureRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: Spacing.base },
  featureChip: {
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)',
  },
  featureText: { fontSize: 11, color: Colors.primaryLight },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.base },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.glassBorder },
  dividerText: { fontSize: Typography.xs, color: Colors.textMuted, marginHorizontal: 10 },
});
