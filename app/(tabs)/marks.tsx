import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchMarks = () => api.get('/marks/my/').then((r) => r.data);

const GRADE_COLORS: Record<string, string> = {
  O: '#FFD700', 'A+': '#00D4AA', A: '#6C63FF',
  'B+': '#3B82F6', B: '#22C55E', C: '#F59E0B', F: '#EF4444',
};

export default function MarksScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-marks'],
    queryFn: fetchMarks,
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
        {/* Header */}
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>🎓 My Marks</Text>
          <Text style={styles.subtitle}>{subjects.length} subject{subjects.length !== 1 ? 's' : ''} · Tap to expand</Text>
        </LinearGradient>

        <View style={styles.content}>
          {subjects.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="ribbon-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No marks recorded yet.</Text>
              <Text style={styles.emptySub}>Your teacher will enter marks after exams.</Text>
            </GlassCard>
          ) : (
            subjects.map((subj: any) => {
              const isOpen = expanded === subj.subject_id;
              const avgPct = subj.marks?.length
                ? Math.round(subj.marks.reduce((a: number, m: any) => a + m.percentage, 0) / subj.marks.length)
                : null;

              return (
                <TouchableOpacity key={subj.subject_id} onPress={() => setExpanded(isOpen ? null : subj.subject_id)} activeOpacity={0.8}>
                  <GlassCard style={styles.card}>
                    {/* Subject header row */}
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subjectCode}>{subj.subject_code}</Text>
                        <Text style={styles.subjectName}>{subj.subject_name}</Text>
                      </View>
                      {avgPct !== null && (
                        <View style={[styles.avgBadge, { borderColor: Colors.primary + '66' }]}>
                          <Text style={styles.avgNum}>{avgPct}%</Text>
                          <Text style={styles.avgLabel}>avg</Text>
                        </View>
                      )}
                      <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18} color={Colors.textMuted} style={{ marginLeft: 8 }}
                      />
                    </View>

                    {/* Expanded exam list */}
                    {isOpen && subj.marks?.map((m: any) => (
                      <View key={m.id} style={styles.examRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.examType}>{formatExamType(m.exam_type)}</Text>
                          <Text style={styles.examScore}>{m.marks_obtained} / {m.total_marks}</Text>
                        </View>
                        {/* Mini progress bar */}
                        <View style={styles.miniBarBg}>
                          <View style={[styles.miniBarFill, {
                            width: `${m.percentage}%` as any,
                            backgroundColor: m.percentage >= 75 ? Colors.success : m.percentage >= 50 ? Colors.warning : Colors.error,
                          }]} />
                        </View>
                        <View style={[styles.gradeBadge, { backgroundColor: (GRADE_COLORS[m.grade] ?? Colors.primary) + '22' }]}>
                          <Text style={[styles.gradeText, { color: GRADE_COLORS[m.grade] ?? Colors.primary }]}>{m.grade}</Text>
                        </View>
                      </View>
                    ))}
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function formatExamType(t: string) {
  const map: Record<string, string> = {
    internal1: 'Internal 1', internal2: 'Internal 2',
    midterm: 'Midterm', final: 'Final',
    practical: 'Practical', assignment: 'Assignment',
  };
  return map[t] ?? t;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  content: { padding: Spacing.base },
  card: { marginBottom: Spacing.md, padding: Spacing.base },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  subjectCode: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold, marginBottom: 2 },
  subjectName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary },
  avgBadge: {
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center',
  },
  avgNum: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
  avgLabel: { fontSize: 9, color: Colors.textMuted },
  examRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  examType: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  examScore: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  miniBarBg: {
    flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3, overflow: 'hidden',
  },
  miniBarFill: { height: '100%', borderRadius: 3 },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm },
  gradeText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md, marginTop: Spacing.xl },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
});
