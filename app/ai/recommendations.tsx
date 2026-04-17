import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const fetchRecommendations = () => api.get('/ai/recommendations/').then((r) => r.data);

const CATEGORY_EMOJI: Record<string, string> = {
  tech: '💻', sports: '⚽', arts: '🎨', music: '🎵', debate: '🎤',
  research: '🔬', hackathon: '🚀', social: '🤝', gaming: '🎮', workshop: '🛠️',
};

export default function RecommendationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: fetchRecommendations,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/ai/recommendations/');
      await refetch();
    } catch {
      Alert.alert('Error', 'Could not refresh recommendations.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎯 AI Recommendations</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <Ionicons name="refresh" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading || refreshing ? (
        <View style={styles.loadingView}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>🤖 AI is analyzing your profile...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.infoCard}>
            <Text style={styles.infoText}>
              🤖 These are personalized activity picks based on your interests, skills, and past participation. Refresh to get updated recommendations!
            </Text>
            {data?.cached && (
              <Text style={styles.cachedText}>⏱ Showing cached results · Refresh for new</Text>
            )}
          </GlassCard>

          {(data?.recommendations || []).map((rec: any, idx: number) => (
            <GlassCard key={idx} style={styles.recCard}>
              <View style={styles.recHeader}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>
                    {CATEGORY_EMOJI[rec.category] || '🎯'} {rec.category}
                  </Text>
                </View>
                <View style={styles.scoreTag}>
                  <Text style={styles.scoreText}>{rec.score}% match</Text>
                </View>
              </View>

              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recReason}>"{rec.reason}"</Text>

              {/* Score Bar */}
              <View style={styles.scoreBar}>
                <LinearGradient
                  colors={['#6C63FF', '#00D4AA']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.scoreBarFill, { width: `${rec.score}%` as any }]}
                />
              </View>
            </GlassCard>
          ))}

          {(!data?.recommendations || data.recommendations.length === 0) && (
            <View style={styles.emptyView}>
              <Text style={{ fontSize: 48 }}>🤖</Text>
              <Text style={styles.emptyText}>No recommendations yet</Text>
              <Text style={styles.emptySubText}>Complete your profile for personalized picks</Text>
              <GradientButton
                label="Refresh Recommendations"
                onPress={handleRefresh}
                style={{ marginTop: 20 }}
              />
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 16 },
  scroll: { padding: Spacing.base },
  infoCard: { marginBottom: Spacing.lg },
  infoText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  cachedText: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 8 },
  recCard: { marginBottom: Spacing.md },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  rankCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary + '30', justifyContent: 'center', alignItems: 'center',
  },
  rankText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary },
  categoryTag: { backgroundColor: Colors.surface2, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  categoryText: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  scoreTag: { marginLeft: 'auto', backgroundColor: Colors.secondary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  scoreText: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: Typography.bold },
  recTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 6 },
  recReason: { fontSize: Typography.sm, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: Spacing.sm, lineHeight: 20 },
  scoreBar: { height: 4, backgroundColor: Colors.surface2, borderRadius: 2, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 2 },
  emptyView: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 },
  emptySubText: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
});
