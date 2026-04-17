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

export default function RegisterScreen() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.first_name) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.replace('/(auth)/setup-profile');
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err?.response?.data) {
        const errors = err.response.data;
        msg = typeof errors === 'object'
          ? Object.values(errors).flat().join('\n')
          : String(errors);
      } else if (err?.message) {
        // Network error or timeout — show the real message
        msg = `Network error: ${err.message}\n\nMake sure your phone and PC are on the same Wi-Fi and Django is running.`;
      }
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'first_name', label: 'First Name *', placeholder: 'Your first name', icon: 'person-outline' },
    { key: 'last_name', label: 'Last Name', placeholder: 'Your last name', icon: 'person-outline' },
    { key: 'username', label: 'Username *', placeholder: 'Choose a username', icon: 'at-outline' },
    { key: 'email', label: 'Email *', placeholder: 'your@email.com', icon: 'mail-outline' },
  ];

  return (
    <LinearGradient colors={['#0A0A1A', '#111128', '#0D0D22']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <LinearGradient colors={['#00D4AA', '#00A8FF']} style={styles.logoCircle}>
              <Text style={{ fontSize: 36 }}>🚀</Text>
            </LinearGradient>
            <Text style={styles.title}>Join SAMS</Text>
            <Text style={styles.subtitle}>Start your AI-powered student journey</Text>
          </View>

          <View style={styles.card}>
            {fields.map((f) => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={f.icon as any} size={18} color={Colors.textMuted} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={(form as any)[f.key]}
                    onChangeText={(v) => update(f.key, v)}
                    autoCapitalize={f.key === 'email' || f.key === 'username' ? 'none' : 'words'}
                    keyboardType={f.key === 'email' ? 'email-address' : 'default'}
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.icon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.textMuted}
                  value={form.password}
                  onChangeText={(v) => update('password', v)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <GradientButton
              label="Create Account 🎉"
              onPress={handleRegister}
              loading={loading}
              colors={['#00D4AA', '#00A8FF']}
              style={{ marginTop: Spacing.md }}
            />

            <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: Colors.primary }}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: Spacing.base, paddingTop: 60 },
  backBtn: { marginBottom: Spacing.base },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md,
  },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.xl, padding: Spacing.xl,
  },
  inputGroup: { marginBottom: Spacing.base },
  label: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: Typography.medium },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 12,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, color: Colors.textPrimary, fontSize: Typography.base, paddingVertical: 13 },
  loginLink: { alignItems: 'center', marginTop: Spacing.base },
  loginLinkText: { fontSize: Typography.sm, color: Colors.textMuted },
});
