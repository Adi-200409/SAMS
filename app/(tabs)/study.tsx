import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const STUDY_TOOLS = [
  { icon: '🍅', title: 'Pomodoro Timer', desc: 'Focus sessions + earn XP', route: '/study/pomodoro', gradient: ['#EF4444', '#F97316'] },
  { icon: '📝', title: 'Note Sharing', desc: 'Upload & browse notes', route: '/study/notes', gradient: ['#3B82F6', '#6366F1'] },
  { icon: '📋', title: 'Assignments', desc: 'Track deadlines with AI', route: '/study/assignments', gradient: ['#22C55E', '#10B981'] },
  { icon: '💡', title: 'Doubt Forum', desc: 'AI answers in seconds', route: '/study/doubts', gradient: ['#F59E0B', '#EF4444'] },
  { icon: '📚', title: 'Resources', desc: 'Curated study materials', route: '/study/resources', gradient: ['#8B5CF6', '#EC4899'] },
  { icon: '🤝', title: 'Skill Exchange', desc: 'Find skill swap partners', route: '/study/skill-exchange', gradient: ['#00D4AA', '#00A8FF'] },
];

const AI_TOOLS = [
  { icon: '🤖', title: 'AI Recommendations', desc: 'Personalized activity picks', route: '/ai/recommendations' },
  { icon: '📄', title: 'Resume Builder', desc: 'One-click AI resume', route: '/ai/resume' },
  { icon: '😊', title: 'Mood Suggestions', desc: 'Events matching your vibe', route: '/ai/mood' },
  { icon: '🗺️', title: 'Career Roadmap', desc: 'AI-powered career guide', route: '/ai/roadmap' },
];

export default function StudyHubScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Study Hub</Text>
          <Text style={styles.subtitle}>Your AI-powered learning toolkit</Text>
        </View>

        {/* Study Tools */}
        <Text style={styles.sectionTitle}>📖 Study Tools</Text>
        <View style={styles.toolsGrid}>
          {STUDY_TOOLS.map((t) => (
            <TouchableOpacity
              key={t.title}
              style={styles.toolBtn}
              onPress={() => router.push(t.route as any)}
              activeOpacity={0.8}
            >
              <GlassCard style={styles.toolCard} noPadding>
                <LinearGradient colors={t.gradient as any} style={styles.toolGradient}>
                  <Text style={styles.toolIcon}>{t.icon}</Text>
                </LinearGradient>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{t.title}</Text>
                  <Text style={styles.toolDesc}>{t.desc}</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Features */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>🤖 AI Features</Text>
        {AI_TOOLS.map((t) => (
          <TouchableOpacity key={t.title} onPress={() => router.push(t.route as any)} activeOpacity={0.8}>
            <GlassCard style={styles.aiCard}>
              <View style={styles.aiRow}>
                <View style={styles.aiIconCircle}>
                  <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiTitle}>{t.title}</Text>
                  <Text style={styles.aiDesc}>{t.desc}</Text>
                </View>
                <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.base, paddingTop: 0 },
  header: { paddingTop: 55, marginBottom: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  toolBtn: { width: '48%' },
  toolCard: { overflow: 'hidden' },
  toolGradient: {
    height: 70, justifyContent: 'center', alignItems: 'center',
    borderRadius: Radius.lg, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
  },
  toolIcon: { fontSize: 32 },
  toolInfo: { padding: Spacing.sm },
  toolTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  toolDesc: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  aiCard: { marginBottom: Spacing.sm },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  aiIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  aiTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  aiDesc: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
});
