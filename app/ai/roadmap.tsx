import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import api from '../../services/api';

export default function CareerRoadmapScreen() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/career-roadmap/');
      setRoadmap(data.roadmap);
    } catch {
      Alert.alert('Error', 'Could not generate career roadmap. Ensure your profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  // Parse roadmap sections from markdown-like text
  const renderRoadmap = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim());
    return lines.map((line, idx) => {
      if (line.startsWith('##') || line.startsWith('**')) {
        return <Text key={idx} style={styles.roadmapSection}>{line.replace(/[#*]/g, '').trim()}</Text>;
      }
      if (line.startsWith('-') || line.startsWith('•')) {
        return (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bullet}>›</Text>
            <Text style={styles.bulletText}>{line.replace(/^[-•]/, '').trim()}</Text>
          </View>
        );
      }
      return <Text key={idx} style={styles.roadmapText}>{line}</Text>;
    });
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Career Roadmap</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🤖</Text>
          <Text style={styles.heroTitle}>AI Career Advisor</Text>
          <Text style={styles.heroText}>
            Get a personalized career roadmap based on your department, interests, and skills.
            The AI analyzes your profile and suggests top career paths, skills to develop, and internship strategies.
          </Text>
          <GradientButton
            label={roadmap ? '🔄 Regenerate' : '✨ Generate My Roadmap'}
            onPress={fetchRoadmap}
            loading={loading}
            colors={['#8B4CF7', '#EC4899']}
            style={{ marginTop: Spacing.md }}
          />
        </GlassCard>

        {loading && (
          <View style={styles.loadingView}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>🤖 AI is building your career roadmap...</Text>
            <Text style={styles.loadingSubText}>This may take 10-15 seconds</Text>
          </View>
        )}

        {roadmap && !loading && (
          <GlassCard style={styles.roadmapCard}>
            {renderRoadmap(roadmap)}
          </GlassCard>
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
  heroCard: { alignItems: 'center', marginBottom: Spacing.lg },
  heroEmoji: { fontSize: 48, marginBottom: Spacing.md },
  heroTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
  heroText: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  loadingView: { alignItems: 'center', marginVertical: Spacing['2xl'] },
  loadingText: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 16 },
  loadingSubText: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  roadmapCard: {},
  roadmapSection: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary, marginVertical: 10 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { color: Colors.secondary, fontSize: Typography.base, fontWeight: Typography.bold },
  bulletText: { fontSize: Typography.sm, color: Colors.textSecondary, flex: 1, lineHeight: 20 },
  roadmapText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: 4 },
});
