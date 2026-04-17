import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const fetchResume = () => api.get('/ai/resume/').then((r) => r.data);

export default function ResumeScreen() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-resume'],
    queryFn: fetchResume,
    retry: false,
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/ai/resume/');
      await refetch();
    } catch {
      Alert.alert('Error', 'Could not generate resume. Make sure your profile is filled out.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📄 AI Resume Builder</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.heroCard}>
          <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>📄</Text>
          <Text style={styles.heroTitle}>One-Click Resume</Text>
          <Text style={styles.heroDesc}>
            Our AI generates a professional, print-ready resume using your SAMS profile data — activities, clubs, badges, skills, and achievements.
          </Text>
          <GradientButton
            label={data?.html ? '🔄 Regenerate Resume' : '✨ Generate My Resume'}
            onPress={handleGenerate}
            loading={generating || isLoading}
            colors={['#3B82F6', '#6366F1']}
            style={{ marginTop: 16 }}
          />
          {data?.cached && <Text style={styles.cachedNote}>⏱ Showing cached resume · Regenerate for fresh version</Text>}
        </GlassCard>

        {(isLoading || generating) && (
          <View style={styles.loadingView}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>🤖 AI is building your resume...</Text>
          </View>
        )}

        {data?.html && !generating && (
          <GlassCard style={styles.resumeCard}>
            <View style={styles.resumeHeader}>
              <Text style={styles.resumeTitle}>✅ Resume Ready!</Text>
              <Text style={styles.resumeSubtitle}>Generated from your SAMS profile data</Text>
            </View>
            {/* Preview the raw text content (HTML stripped for mobile) */}
            <Text style={styles.resumePreviewText}>
              {data.html
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 800) + '...'
              }
            </Text>
            <View style={styles.actionRow}>
              <View style={styles.infoNote}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.infoText}>Full HTML resume can be shared or printed from the web app</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Tips */}
        <GlassCard style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Tips for a better resume</Text>
          {[
            'Fill out your bio, skills, and interests in your profile',
            'Join clubs and register for activities to have more content',
            'Earn badges — they show up as achievements',
            'Add your GitHub and LinkedIn URLs',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>›</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing.base, paddingBottom: 30 },
  heroCard: { alignItems: 'center', marginBottom: Spacing.lg },
  heroTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
  heroDesc: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  cachedNote: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 10, textAlign: 'center' },
  loadingView: { alignItems: 'center', marginVertical: 30 },
  loadingText: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 12 },
  resumeCard: { marginBottom: Spacing.md },
  resumeHeader: { marginBottom: Spacing.md },
  resumeTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.success },
  resumeSubtitle: { fontSize: Typography.xs, color: Colors.textMuted },
  resumePreviewText: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, fontFamily: 'monospace' },
  actionRow: { marginTop: Spacing.md },
  infoNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  infoText: { fontSize: Typography.xs, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  tipsCard: {},
  tipsTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipBullet: { color: Colors.primary, fontWeight: Typography.bold },
  tipText: { fontSize: Typography.xs, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
