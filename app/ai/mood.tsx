import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import api from '../../services/api';

const MOODS = [
  { level: 1, emoji: '😔', label: 'Very Low' },
  { level: 2, emoji: '😕', label: 'A bit down' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '😊', label: 'Good' },
  { level: 5, emoji: '🤩', label: 'Excellent' },
];

export default function MoodScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodText, setMoodText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Select a mood first!');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/mood/', {
        mood_level: selectedMood,
        mood_text: moodText,
      });
      setResult(data);
    } catch {
      Alert.alert('Error', 'Could not get mood suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>😊 Mood Check-In</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.moodCard}>
          <Text style={styles.question}>How are you feeling right now?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.level}
                style={[styles.moodBtn, selectedMood === m.level && styles.moodBtnActive]}
                onPress={() => setSelectedMood(m.level)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === m.level && { color: Colors.primary }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.optionalLabel}>Tell us more (optional)</Text>
          <View style={styles.textArea}>
            <Text
              style={styles.textAreaInput}
              onPress={() => {}}
            >{moodText || 'e.g. Feeling stressed about exams...'}</Text>
          </View>

          <GradientButton
            label="Get AI Suggestions 🤖"
            onPress={handleSubmit}
            loading={loading}
            disabled={!selectedMood}
            colors={['#EC4899', '#8B4CF7']}
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

        {result && (
          <>
            <GlassCard style={[styles.messageCard, { borderColor: Colors.secondary + '40' }]}>
              <Text style={styles.messageLabel}>💬 AI Message for You</Text>
              <Text style={styles.messageText}>"{result.message}"</Text>
            </GlassCard>

            <Text style={styles.sectionTitle}>🎯 Suggested Activities</Text>
            {result.suggestions?.map((s: any, i: number) => (
              <GlassCard key={i} style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>{s.title}</Text>
                <Text style={styles.suggestionReason}>{s.reason}</Text>
              </GlassCard>
            ))}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing.base },
  moodCard: { marginBottom: Spacing.lg },
  question: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.lg },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  moodBtn: { alignItems: 'center', padding: 10, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'transparent', flex: 1 },
  moodBtnActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  moodEmoji: { fontSize: 30 },
  moodLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  optionalLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 8 },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, padding: 12, minHeight: 80,
  },
  textAreaInput: { color: Colors.textMuted, fontSize: Typography.sm },
  messageCard: { marginBottom: Spacing.md },
  messageLabel: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.secondary, marginBottom: 8 },
  messageText: { fontSize: Typography.base, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 24 },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  suggestionCard: { marginBottom: Spacing.sm },
  suggestionTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  suggestionReason: { fontSize: Typography.xs, color: Colors.textSecondary },
});
