import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchAttendance = () => api.get('/attendance/my/').then((r) => r.data);

export default function AttendanceScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-attendance'],
    queryFn: fetchAttendance,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const subjects: any[] = data ?? [];
  const overall = subjects.length
    ? Math.round(subjects.reduce((acc, s) => acc + (s.percentage ?? 0), 0) / subjects.length)
    : null;

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>📊 My Attendance</Text>
          {overall !== null && (
            <View style={styles.overallRow}>
              <View style={[styles.overallCircle, { borderColor: getStatusColor(overall) }]}>
                <Text style={[styles.overallPct, { color: getStatusColor(overall) }]}>{overall}%</Text>
                <Text style={styles.overallLabel}>Overall</Text>
              </View>
              <View style={styles.legendCol}>
                <LegendItem color={Colors.success} label="≥75%  Good" />
                <LegendItem color={Colors.warning} label="60-74%  Warning" />
                <LegendItem color={Colors.error}   label="<60%   Low" />
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {subjects.length === 0 ? (
            <EmptyState icon="calendar-outline" message="No enrolled subjects yet." sub="Register for courses to track attendance." />
          ) : (
            subjects.map((subj: any) => (
              <GlassCard key={subj.subject_id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectCode}>{subj.subject_code}</Text>
                    <Text style={styles.subjectName}>{subj.subject_name}</Text>
                    <Text style={styles.dept}>{subj.department}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(subj.percentage ?? 0) + '22' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(subj.percentage ?? 0) }]}>
                      {subj.percentage !== null ? `${subj.percentage}%` : 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(subj.percentage ?? 0, 100)}%` as any,
                        backgroundColor: getStatusColor(subj.percentage ?? 0),
                      },
                    ]}
                  />
                </View>

                <View style={styles.statsRow}>
                  <StatChip icon="checkmark-circle" color={Colors.success} label="Present" val={subj.present} />
                  <StatChip icon="close-circle"     color={Colors.error}   label="Absent"  val={subj.absent} />
                  <StatChip icon="calendar"          color={Colors.primary} label="Total"   val={subj.total_classes} />
                </View>

                {(subj.percentage ?? 0) < 75 && (
                  <View style={styles.warningBanner}>
                    <Ionicons name="warning-outline" size={14} color={Colors.warning} />
                    <Text style={styles.warningText}>
                      {subj.percentage !== null
                        ? `Need ${Math.ceil((0.75 * subj.total_classes - subj.present) / 0.25)} more classes to reach 75%`
                        : 'No attendance recorded yet'}
                    </Text>
                  </View>
                )}
              </GlassCard>
            ))
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ color: Colors.textMuted, fontSize: Typography.xs }}>{label}</Text>
    </View>
  );
}

function StatChip({ icon, color, label, val }: any) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.statVal, { color }]}>{val}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ icon, message, sub }: { icon: any; message: string; sub: string }) {
  return (
    <GlassCard style={styles.emptyCard}>
      <Ionicons name={icon} size={48} color={Colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </GlassCard>
  );
}

function getStatusColor(pct: number) {
  if (pct >= 75) return Colors.success;
  if (pct >= 60) return Colors.warning;
  return Colors.error;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  overallCircle: {
    width: 88, height: 88, borderRadius: 44, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  overallPct: { fontSize: Typography.xl, fontWeight: Typography.bold },
  overallLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  legendCol: { flex: 1 },
  content: { padding: Spacing.base },
  card: { marginBottom: Spacing.md, padding: Spacing.base },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  subjectCode: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold, marginBottom: 2 },
  subjectName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  dept: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, justifyContent: 'center' },
  badgeText: { fontSize: Typography.lg, fontWeight: Typography.bold },
  barBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: Spacing.md, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statChip: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontSize: Typography.base, fontWeight: Typography.bold },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.md, padding: Spacing.sm,
    backgroundColor: Colors.warning + '18', borderRadius: Radius.sm,
  },
  warningText: { fontSize: Typography.xs, color: Colors.warning, flex: 1 },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
});
