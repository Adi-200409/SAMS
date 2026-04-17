import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, Radius, getLevelGradient } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import AnimatedPressable from '../../components/ui/AnimatedPressable';

const fetchDashboard = () => api.get('/dashboard/').then((r) => r.data);

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const profile = data?.profile;
  const levelGrad = getLevelGradient(profile?.level || 1);

  const quickActions = [
    { icon: '🍅', label: 'Pomodoro', route: '/study/pomodoro' },
    { icon: '🤖', label: 'AI Recs', route: '/ai/recommendations' },
    { icon: '📄', label: 'Resume', route: '/ai/resume' },
    { icon: '😊', label: 'Mood', route: '/ai/mood' },
    { icon: '📝', label: 'Notes', route: '/study/notes' },
    { icon: '📋', label: 'Tasks', route: '/study/assignments' },
    { icon: '💡', label: 'Doubts', route: '/study/doubts' },
    { icon: '🗺️', label: 'Roadmap', route: '/ai/roadmap' },
  ];

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good {getTimeOfDay()}, 👋</Text>
              <Text style={styles.userName}>{user?.first_name || user?.username}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <LinearGradient colors={levelGrad as any} style={styles.levelCircle}>
                <Text style={styles.levelNum}>{profile?.level || 1}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.levelTitle}>{profile?.level_title}</Text>
                <Text style={styles.pointsText}>⭐ {profile?.points || 0} pts</Text>
              </View>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${getXpPercent(profile?.points || 0, profile?.level || 1)}%` as any }]}>
              <LinearGradient colors={levelGrad as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 4 }} />
            </View>
          </View>
          <Text style={styles.xpLabel}>🔥 {profile?.streak_days || 0} day streak</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats */}
          <View style={{ marginHorizontal: -Spacing.base }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.md }}>
              {[
                { label: 'Events', val: data?.stats?.activities, icon: '🎯', color: Colors.primary },
                { label: 'Students', val: data?.stats?.students, icon: '👥', color: Colors.secondary },
                { label: 'Clubs', val: data?.stats?.clubs, icon: '🏛️', color: Colors.accent },
              ].map((s, idx) => (
                <GlassCard key={s.label} delay={idx * 100} style={styles.statCard}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.val?.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </GlassCard>
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ marginHorizontal: -Spacing.base }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.sm }}>
              {quickActions.map((a, idx) => (
                <AnimatedPressable
                  key={a.label}
                  style={styles.actionBtn}
                  onPress={() => router.push(a.route as any)}
                >
                  <GlassCard delay={idx * 50} style={styles.actionCard} glowColor={Colors.primary}>
                    <Text style={styles.actionIcon}>{a.icon}</Text>
                    <Text style={styles.actionLabel}>{a.label}</Text>
                  </GlassCard>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </View>

          {/* Upcoming Events */}
          {(data?.upcoming_activities?.length > 0) && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/activities')}>
                  <Text style={styles.seeAll}>See all →</Text>
                </TouchableOpacity>
              </View>
              {data.upcoming_activities.slice(0, 3).map((act: any, idx: number) => (
                <AnimatedPressable key={act.id} onPress={() => router.push(`/activity/${act.id}` as any)}>
                  <GlassCard delay={idx * 150} style={styles.eventCard}>
                    <View style={styles.eventRow}>
                      <View style={[styles.catDot, { backgroundColor: Colors.primary }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle} numberOfLines={1}>{act.title}</Text>
                        <Text style={styles.eventMeta}>
                          📍 {act.venue} · 🗓️ {new Date(act.start_date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.pointsReward}>+{act.points_reward}pts</Text>
                    </View>
                  </GlassCard>
                </AnimatedPressable>
              ))}
            </>
          )}

          {/* Pending Assignments */}
          {(data?.pending_assignments?.length > 0) && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Pending Tasks</Text>
                <TouchableOpacity onPress={() => router.push('/study/assignments' as any)}>
                  <Text style={styles.seeAll}>See all →</Text>
                </TouchableOpacity>
              </View>
              {data.pending_assignments.map((a: any, idx: number) => (
                <AnimatedPressable key={a.id} onPress={() => router.push('/study/assignments' as any)}>
                  <GlassCard delay={idx * 150} style={styles.assignCard}>
                    <View style={styles.assignRow}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(a.priority) }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.assignTitle} numberOfLines={1}>{a.title}</Text>
                        <Text style={styles.assignMeta}>{a.subject} · {a.days_until_deadline}d left</Text>
                      </View>
                      <Text style={styles.priorityBadge}>{a.priority.toUpperCase()}</Text>
                    </View>
                  </GlassCard>
                </AnimatedPressable>
              ))}
            </>
          )}

          {/* Recent Badges */}
          {(data?.recent_badges?.length > 0) && (
            <>
              <Text style={styles.sectionTitle}>Recent Badges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.base }}>
                <View style={styles.badgeRow}>
                  {data.recent_badges.map((ub: any) => (
                    <GlassCard key={ub.id} style={styles.badgeCard}>
                      <Text style={styles.badgeIcon}>{ub.badge.icon}</Text>
                      <Text style={styles.badgeName}>{ub.badge.name}</Text>
                    </GlassCard>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function getXpPercent(points: number, level: number) {
  const thresholds = [0, 100, 300, 600, 1000, 9999];
  const min = thresholds[level - 1] || 0;
  const max = thresholds[level] || 1000;
  return Math.min(((points - min) / (max - min)) * 100, 100);
}

function getPriorityColor(p: string) {
  const map: any = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444', urgent: '#DC2626' };
  return map[p] || Colors.primary;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  greeting: { fontSize: Typography.sm, color: Colors.textMuted },
  userName: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  levelNum: { fontSize: Typography.lg, fontWeight: Typography.bold, color: '#fff' },
  levelTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  pointsText: { fontSize: Typography.xs, color: Colors.textMuted },
  xpBar: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3, marginBottom: 6, overflow: 'hidden',
  },
  xpFill: { height: '100%' },
  xpLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  content: { padding: Spacing.base },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { width: 120, alignItems: 'center', padding: Spacing.md },
  statIcon: { fontSize: 26, marginBottom: 8 },
  statVal: { fontSize: Typography['2xl'], fontWeight: Typography.bold },
  statLabel: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.textPrimary, marginBottom: Spacing.md, letterSpacing: 0.5 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  seeAll: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.bold },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  actionBtn: { width: 90 },
  actionCard: { alignItems: 'center', padding: Spacing.md, justifyContent: 'center', minHeight: 90 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: Typography.xs, color: Colors.textSecondary, textAlign: 'center', fontWeight: Typography.semibold },
  eventCard: { marginBottom: Spacing.sm, padding: Spacing.md },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  eventTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  eventMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  pointsReward: { fontSize: Typography.xs, color: Colors.secondary, fontWeight: Typography.semibold },
  assignCard: { marginBottom: Spacing.sm, padding: Spacing.md },
  assignRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  assignTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  assignMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  priorityBadge: { fontSize: 9, color: Colors.warning, fontWeight: Typography.bold },
  badgeRow: { flexDirection: 'row', paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.xl },
  badgeCard: { alignItems: 'center', padding: Spacing.md, minWidth: 80 },
  badgeIcon: { fontSize: 28 },
  badgeName: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
