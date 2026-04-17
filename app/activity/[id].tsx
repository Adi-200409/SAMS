import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius, getCategoryColor } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => api.get(`/activities/${id}/`).then((r) => r.data),
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/activities/${id}/`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['activity', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      Alert.alert(res.data.is_registered ? '🎉 Registered!' : '✅ Unregistered',
        res.data.is_registered ? `You're registered! +30 pts earned.` : 'Removed from your registrations.');
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail || 'Action failed.'),
  });

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!activity) return null;
  const catColor = getCategoryColor(activity.category);

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[catColor + '40', '#0A0A1A']} style={styles.hero}>
          <View style={[styles.catBadge, { backgroundColor: catColor + '30' }]}>
            <Text style={[styles.catText, { color: catColor }]}>{activity.category}</Text>
          </View>
          <Text style={styles.title}>{activity.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>⭐ +{activity.points_reward} pts</Text>
            <View style={[styles.statusBadge, { backgroundColor: activity.status === 'upcoming' ? Colors.secondary + '20' : Colors.primary + '20' }]}>
              <Text style={styles.statusText}>{activity.status}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Key Info */}
          <GlassCard style={styles.infoCard}>
            {[
              { icon: '📍', label: 'Venue', val: activity.venue },
              { icon: '🗓️', label: 'Start', val: new Date(activity.start_date).toLocaleString() },
              { icon: '🏁', label: 'End', val: new Date(activity.end_date).toLocaleString() },
              { icon: '⏰', label: 'Register by', val: new Date(activity.registration_deadline).toLocaleString() },
              { icon: '👥', label: 'Participants', val: `${activity.registered_count} / ${activity.max_participants}` },
              { icon: '🎪', label: 'Organizer', val: activity.organizer_name },
            ].map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoVal}>{item.val}</Text>
              </View>
            ))}
          </GlassCard>

          {/* Description */}
          <GlassCard style={styles.infoCard}>
            <Text style={styles.sectionTitle}>About this Event</Text>
            <Text style={styles.description}>{activity.description}</Text>
          </GlassCard>

          {/* AI Summary */}
          {activity.ai_summary && (
            <GlassCard style={[styles.infoCard, { borderColor: Colors.primary + '30' }]}>
              <Text style={styles.aiLabel}>🤖 AI Summary</Text>
              <Text style={styles.aiText}>{activity.ai_summary}</Text>
            </GlassCard>
          )}

          {/* Register Button */}
          {activity.status === 'upcoming' && (
            <GradientButton
              label={activity.is_registered ? '✓ Unregister' : activity.is_full ? '⛔ Event Full' : '🎯 Register Now'}
              onPress={() => registerMutation.mutate()}
              loading={registerMutation.isPending}
              disabled={activity.is_full && !activity.is_registered}
              colors={activity.is_registered ? ['#EF4444', '#DC2626'] : Colors.gradientSecondary as any}
              style={styles.registerBtn}
            />
          )}

          {activity.is_virtual && activity.virtual_link && (
            <GlassCard style={styles.infoCard}>
              <Text style={styles.sectionTitle}>🌐 Virtual Event</Text>
              <Text style={styles.link}>{activity.virtual_link}</Text>
            </GlassCard>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: Spacing.base, paddingBottom: 8, position: 'absolute', zIndex: 10, top: 0 },
  backBtn: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  hero: { paddingTop: 96, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  catBadge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  catText: { fontSize: Typography.xs, fontWeight: Typography.bold, textTransform: 'capitalize' },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaItem: { fontSize: Typography.sm, color: Colors.secondary, fontWeight: Typography.semibold },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  content: { padding: Spacing.base },
  infoCard: { marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  infoIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  infoLabel: { fontSize: Typography.xs, color: Colors.textMuted, width: 90 },
  infoVal: { fontSize: Typography.sm, color: Colors.textPrimary, flex: 1 },
  sectionTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
  description: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22 },
  aiLabel: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary, marginBottom: 6 },
  aiText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },
  registerBtn: { marginBottom: Spacing.md },
  link: { fontSize: Typography.sm, color: Colors.primary },
});
