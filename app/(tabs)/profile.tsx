import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, Radius, getLevelGradient } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import api from '../../services/api';

const fetchProfile = () => api.get('/profile/').then((r) => r.data);

export default function ProfileScreen() {
  const { user, profile: authProfile, logout } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const profile = data?.profile || authProfile;
  const levelGrad = getLevelGradient(profile?.level || 1);
  const studyStats = data?.study_stats || {};

  const statItems = [
    { label: 'Points', value: profile?.points?.toLocaleString() || '0', icon: '⭐' },
    { label: 'Streak', value: `${profile?.streak_days || 0}d`, icon: '🔥' },
    { label: 'Sessions', value: studyStats.total_sessions || 0, icon: '🍅' },
    { label: 'Done', value: studyStats.assignments_done || 0, icon: '✅' },
  ];

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner / Avatar Area */}
        <LinearGradient colors={levelGrad as any} style={styles.banner}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Name + Level */}
          <View style={styles.nameRow}>
            <View>
              <Text style={styles.fullName}>{user?.first_name} {user?.last_name}</Text>
              <Text style={styles.username}>@{user?.username}</Text>
            </View>
            <View style={styles.levelBadge}>
              <LinearGradient colors={levelGrad as any} style={styles.levelGrad}>
                <Text style={styles.levelText}>Lv. {profile?.level}</Text>
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.levelTitle}>{profile?.level_title}</Text>
          {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          {/* Info Tags */}
          <View style={styles.tagRow}>
            {profile?.college && <Tag icon="🏛️" text={profile.college} />}
            {profile?.department && <Tag icon="📚" text={profile.department} />}
            {profile?.year && <Tag icon="🎓" text={`Year ${profile.year}`} />}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {statItems.map((s, idx) => (
              <GlassCard key={s.label} delay={idx * 100} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </GlassCard>
            ))}
          </View>

          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <GlassCard delay={200} style={styles.infoCard}>
              <Text style={styles.infoTitle}>⚡ Skills</Text>
              <View style={styles.chipRow}>
                {profile.skills.map((s: string) => <Chip key={s} label={s} color={Colors.primary} />)}
              </View>
            </GlassCard>
          )}

          {/* Interests */}
          {profile?.interests?.length > 0 && (
            <GlassCard delay={300} style={styles.infoCard}>
              <Text style={styles.infoTitle}>🎯 Interests</Text>
              <View style={styles.chipRow}>
                {profile.interests.map((i: string) => <Chip key={i} label={i} color={Colors.secondary} />)}
              </View>
            </GlassCard>
          )}

          {/* Links */}
          {(profile?.github_url || profile?.linkedin_url) && (
            <GlassCard delay={400} style={styles.infoCard}>
              <Text style={styles.infoTitle}>🔗 Links</Text>
              {profile.github_url && <Text style={styles.link}>🐙 {profile.github_url}</Text>}
              {profile.linkedin_url && <Text style={styles.link}>💼 {profile.linkedin_url}</Text>}
            </GlassCard>
          )}

          {/* Recent Badges */}
          {data?.badges?.length > 0 && (
            <GlassCard delay={500} style={styles.infoCard}>
              <Text style={styles.infoTitle}>🏅 Badges ({data.badges.length})</Text>
              <View style={styles.chipRow}>
                {data.badges.slice(0, 8).map((ub: any) => (
                  <View key={ub.id} style={styles.badgeChip}>
                    <Text style={{ fontSize: 20 }}>{ub.badge.icon}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          )}

          <GradientButton
            label="Sign Out"
            onPress={handleLogout}
            outline
            style={{ marginTop: Spacing.lg }}
          />

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function Tag({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={tagStyles.tag}>
      <Text style={tagStyles.text}>{icon} {text}</Text>
    </View>
  );
}
const tagStyles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  text: { fontSize: Typography.xs, color: Colors.textSecondary },
});

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[chipStyles.chip, { backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Text style={[chipStyles.text, { color }]}>{label}</Text>
    </View>
  );
}
const chipStyles = StyleSheet.create({
  chip: { borderRadius: Radius.full, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: Typography.xs, fontWeight: Typography.medium, textTransform: 'capitalize' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { height: 160, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 0 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', marginBottom: -45,
  },
  content: { paddingTop: 55, paddingHorizontal: Spacing.base },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  fullName: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  username: { fontSize: Typography.sm, color: Colors.textMuted },
  levelBadge: { borderRadius: Radius.full, overflow: 'hidden' },
  levelGrad: { paddingHorizontal: 14, paddingVertical: 6 },
  levelText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  levelTitle: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold, marginBottom: 8 },
  bio: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  infoCard: { marginBottom: Spacing.sm },
  infoTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { fontSize: Typography.sm, color: Colors.primary, marginBottom: 4 },
  badgeChip: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center',
  },
});
