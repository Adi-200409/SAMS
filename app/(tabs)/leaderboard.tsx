import React from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, Radius, getLevelGradient } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchLeaderboard = () => api.get('/leaderboard/').then((r) => r.data);
const fetchBadges = () => api.get('/my-badges/').then((r) => r.data);

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const { user } = useAuthStore();
  const { data: leaders, isLoading } = useQuery({ queryKey: ['leaderboard'], queryFn: fetchLeaderboard });
  const { data: badges } = useQuery({ queryKey: ['my-badges'], queryFn: fetchBadges });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const myRank = leaders?.findIndex((l: any) => l.username === user?.username) + 1;

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <FlatList
        data={leaders || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>🏆 Leaderboard</Text>
              {myRank > 0 && (
                <View style={styles.myRankCard}>
                  <Text style={styles.myRankText}>Your Rank: <Text style={{ color: Colors.primary }}>#{myRank}</Text></Text>
                </View>
              )}
            </View>

            {/* Top 3 Podium */}
            {leaders?.length >= 3 && (
              <View style={styles.podium}>
                <PodiumCard item={leaders[1]} rank={2} />
                <PodiumCard item={leaders[0]} rank={1} isFirst />
                <PodiumCard item={leaders[2]} rank={3} />
              </View>
            )}

            {/* My Badges */}
            {badges?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>My Badges</Text>
                <View style={styles.badgeGrid}>
                  {badges.map((ub: any) => (
                    <GlassCard key={ub.id} style={styles.badgeCard}>
                      <Text style={styles.badgeIcon}>{ub.badge.icon}</Text>
                      <Text style={styles.badgeName}>{ub.badge.name}</Text>
                      {ub.badge.is_rare && <Text style={styles.rareBadge}>⚡ RARE</Text>}
                    </GlassCard>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.sectionTitle}>Full Rankings</Text>
          </>
        }
        renderItem={({ item, index }) => (
          <GlassCard style={[
            styles.rankCard,
            item.username === user?.username && styles.rankCardHighlight,
          ]}>
            <View style={styles.rankRow}>
              <Text style={styles.rankNum}>
                {index < 3 ? RANK_MEDALS[index] : `#${index + 1}`}
              </Text>
              <View style={styles.avatarPlaceholder}>
                <Text style={{ fontSize: 16 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rankName}>{item.full_name}</Text>
                <Text style={styles.rankLevel}>{item.level_title} · 🔥 {item.streak_days}d</Text>
              </View>
              <Text style={styles.rankPoints}>{item.points?.toLocaleString()} pts</Text>
            </View>
          </GlassCard>
        )}
      />
    </LinearGradient>
  );
}

function PodiumCard({ item, rank, isFirst }: any) {
  const grad = getLevelGradient(isFirst ? 5 : rank === 2 ? 2 : 3);
  return (
    <View style={[styles.podiumCard, isFirst && styles.podiumFirst]}>
      <LinearGradient colors={grad as any} style={styles.podiumAvatar}>
        <Text style={{ fontSize: 20 }}>👤</Text>
      </LinearGradient>
      <Text style={styles.podiumRank}>{RANK_MEDALS[rank - 1]}</Text>
      <Text style={styles.podiumName} numberOfLines={1}>{item?.full_name}</Text>
      <Text style={styles.podiumPts}>{item?.points?.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.base, paddingTop: 0, paddingBottom: 30 },
  header: { paddingTop: 55, marginBottom: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  myRankCard: {
    marginTop: Spacing.sm, alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20', borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  myRankText: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.semibold },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10, marginBottom: Spacing.xl },
  podiumCard: { alignItems: 'center', flex: 1 },
  podiumFirst: { marginBottom: 20 },
  podiumAvatar: {
    width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  podiumRank: { fontSize: 20 },
  podiumName: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', fontWeight: Typography.semibold },
  podiumPts: { fontSize: Typography.xs, color: Colors.primary },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  badgeCard: { alignItems: 'center', padding: Spacing.md, width: '30%' },
  badgeIcon: { fontSize: 28 },
  badgeName: { fontSize: Typography.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  rareBadge: { fontSize: 9, color: Colors.warning, fontWeight: Typography.bold, marginTop: 4 },
  rankCard: { marginBottom: Spacing.sm, padding: Spacing.md },
  rankCardHighlight: { borderColor: Colors.primary, borderWidth: 1.5 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankNum: { width: 30, fontSize: Typography.lg, textAlign: 'center' },
  avatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center',
  },
  rankName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  rankLevel: { fontSize: Typography.xs, color: Colors.textMuted },
  rankPoints: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary },
});
