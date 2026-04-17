import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GradientButton from '../../components/ui/GradientButton';
import api from '../../services/api';

const INTEREST_CHOICES = [
  { key: 'tech', label: '💻 Tech' }, { key: 'sports', label: '⚽ Sports' },
  { key: 'arts', label: '🎨 Arts' }, { key: 'music', label: '🎵 Music' },
  { key: 'debate', label: '🎤 Debate' }, { key: 'research', label: '🔬 Research' },
  { key: 'entrepreneurship', label: '💡 Startup' }, { key: 'social', label: '🤝 Social' },
  { key: 'gaming', label: '🎮 Gaming' }, { key: 'photography', label: '📷 Photo' },
];

const YEAR_CHOICES = ['1', '2', '3', '4', '5'];

export default function SetupProfileScreen() {
  const [form, setForm] = useState({
    college: '', department: '', year: '1', bio: '',
    roll_number: '', skills: '', skills_wanted: '', github_url: '', linkedin_url: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuthStore();
  const router = useRouter();

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        interests: selectedInterests,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        skills_wanted: form.skills_wanted.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.post('/profile/setup/', payload);
      updateProfile(data.profile);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 2</Text>
          <Text style={styles.title}>Build Your Profile</Text>
          <Text style={styles.subtitle}>Help our AI personalize your experience</Text>
        </View>

        <View style={styles.card}>
          {/* Basic Info */}
          <Text style={styles.sectionTitle}>📚 Academic Info</Text>

          {[
            { key: 'college', label: 'College Name', placeholder: 'e.g. IIT Bombay' },
            { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science' },
            { key: 'roll_number', label: 'Roll Number', placeholder: 'e.g. CS21B001' },
          ].map((f) => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                value={(form as any)[f.key]}
                onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year of Study</Text>
            <View style={styles.yearRow}>
              {YEAR_CHOICES.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.yearChip, form.year === y && styles.yearChipActive]}
                  onPress={() => setForm((f) => ({ ...f, year: y }))}
                >
                  <Text style={[styles.yearText, form.year === y && styles.yearTextActive]}>
                    Year {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={Colors.textMuted}
              value={form.bio}
              onChangeText={(v) => setForm((f) => ({ ...f, bio: v }))}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Interests */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>🎯 Your Interests</Text>
          <View style={styles.interestGrid}>
            {INTEREST_CHOICES.map((i) => (
              <TouchableOpacity
                key={i.key}
                style={[styles.interestChip, selectedInterests.includes(i.key) && styles.interestActive]}
                onPress={() => toggleInterest(i.key)}
              >
                <Text style={[styles.interestText, selectedInterests.includes(i.key) && styles.interestTextActive]}>
                  {i.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Skills */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>⚡ Skills</Text>
          {[
            { key: 'skills', label: 'Skills You Have', placeholder: 'Python, React, Figma...' },
            { key: 'skills_wanted', label: 'Skills You Want to Learn', placeholder: 'ML, Public Speaking...' },
          ].map((f) => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label} (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                value={(form as any)[f.key]}
                onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
              />
            </View>
          ))}

          {/* Links */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>🔗 Social Links</Text>
          {[
            { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/username' },
            { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
          ].map((f) => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                value={(form as any)[f.key]}
                onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          ))}

          <GradientButton
            label="Complete Setup 🎉"
            onPress={handleSetup}
            loading={loading}
            style={{ marginTop: Spacing.xl }}
          />

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: Spacing.xl },
  step: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semibold, marginBottom: 4 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.xl, padding: Spacing.xl,
  },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: Spacing.md },
  inputGroup: { marginBottom: Spacing.base },
  label: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12,
    color: Colors.textPrimary, fontSize: Typography.base,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  yearRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  yearChip: {
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  yearChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  yearText: { fontSize: Typography.sm, color: Colors.textMuted },
  yearTextActive: { color: '#fff', fontWeight: Typography.semibold },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: {
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  interestActive: { backgroundColor: 'rgba(108,99,255,0.25)', borderColor: Colors.primary },
  interestText: { fontSize: Typography.sm, color: Colors.textMuted },
  interestTextActive: { color: Colors.primaryLight, fontWeight: Typography.medium },
  skipBtn: { alignItems: 'center', marginTop: Spacing.base },
  skipText: { fontSize: Typography.sm, color: Colors.textMuted },
});
