import React from 'react';
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
import ActivityCard from '../../components/activities/ActivityCard';

const fetchClub = (id: string) => api.get(`/clubs/${id}/`).then((r) => r.data);

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['club', id],
    queryFn: () => fetchClub(id),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/clubs/${id}/`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['club', id] });
      Alert.alert(res.data.is_member ? '🎉 Joined!' : '✅ Left', res.data.detail);
    },
  });

  if (isLoading) {
    return (
      <View style={[{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const club = data?.club;
  if (!club) return null;
  const catColor = getCategoryColor(club.category);

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[catColor + '40', '#0A0A1A']} style={styles.hero}>
          <View style={[styles.catBadge, { backgroundColor: catColor + '30' }]}>
            <Text style={[styles.catText, { color: catColor }]}>{club.category}</Text>
          </View>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.memberCount}>👥 {club.member_count} Members · 🧑‍💼 {club.president_name}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <GlassCard style={styles.descCard}>
            <Text style={styles.desc}>{club.description}</Text>
          </GlassCard>

          <GradientButton
            label={club.is_member ? 'Leave Club' : '+ Join Club'}
            onPress={() => joinMutation.mutate()}
            loading={joinMutation.isPending}
            colors={club.is_member ? ['#EF4444', '#DC2626'] : [catColor, catColor + 'AA']}
            style={styles.joinBtn}
          />

          {data?.activities?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Club Events</Text>
              {data.activities.map((act: any) => (
                <TouchableOpacity key={act.id} onPress={() => router.push(`/activity/${act.id}` as any)}>
                  <GlassCard style={styles.actCard}>
                    <Text style={styles.actTitle}>{act.title}</Text>
                    <Text style={styles.actMeta}>🗓️ {new Date(act.start_date).toLocaleDateString()} · +{act.points_reward}pts</Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </>
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
  hero: { paddingTop: 90, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  catBadge: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  catText: { fontSize: Typography.xs, fontWeight: Typography.bold, textTransform: 'capitalize' },
  clubName: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
  memberCount: { fontSize: Typography.sm, color: Colors.textMuted },
  content: { padding: Spacing.base },
  descCard: { marginBottom: Spacing.md },
  desc: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 22 },
  joinBtn: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  actCard: { marginBottom: Spacing.sm },
  actTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  actMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 4 },
});
