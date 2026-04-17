import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchTeacherSubjects = () =>
  api.get('/subjects/').then((r) =>
    r.data.filter((s: any) => s.teacher !== null)
  );

export default function TeacherClassesScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: fetchTeacherSubjects,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const subjects: any[] = data ?? [];

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>👩‍🏫 My Classes</Text>
          <Text style={styles.sub}>{subjects.length} subject{subjects.length !== 1 ? 's' : ''} assigned</Text>
        </LinearGradient>

        <View style={styles.content}>
          {subjects.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No subjects assigned yet.</Text>
              <Text style={styles.emptySub}>Ask admin to assign subjects to your account.</Text>
            </GlassCard>
          ) : (
            subjects.map((subj: any) => (
              <GlassCard key={subj.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.code}>{subj.code} · Sem {subj.semester}</Text>
                    <Text style={styles.name}>{subj.name}</Text>
                    <Text style={styles.dept}>{subj.department} · {subj.credits} credits</Text>
                  </View>
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledNum}>{subj.enrolled_count}</Text>
                    <Text style={styles.enrolledLabel}>students</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <ActionBtn
                    icon="clipboard-outline" label="Attendance"
                    color={Colors.secondary}
                    onPress={() => router.push({ pathname: '/teacher/mark-attendance', params: { subject_id: subj.id, subject_name: subj.name } } as any)}
                  />
                  <ActionBtn
                    icon="create-outline" label="Enter Marks"
                    color={Colors.accent}
                    onPress={() => router.push({ pathname: '/teacher/enter-marks', params: { subject_id: subj.id, subject_name: subj.name } } as any)}
                  />
                </View>
              </GlassCard>
            ))
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ActionBtn({ icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.actionBtn, { borderColor: color + '66' }]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  sub: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  content: { padding: Spacing.base },
  card: { marginBottom: Spacing.md, padding: Spacing.base },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  code: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold, marginBottom: 2 },
  name: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  dept: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  enrolledBadge: { alignItems: 'center' },
  enrolledNum: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.secondary },
  enrolledLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  actionLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
});
