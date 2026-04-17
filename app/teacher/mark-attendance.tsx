import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchClassData = (subject_id: string) =>
  api.get(`/attendance/class/${subject_id}/`).then((r) => r.data);

type AttStatus = 'present' | 'absent' | 'late';
const STATUSES: AttStatus[] = ['present', 'absent', 'late'];
const STATUS_COLORS = { present: Colors.success, absent: Colors.error, late: Colors.warning };
const STATUS_ICONS  = { present: 'checkmark-circle', absent: 'close-circle', late: 'time' } as const;

export default function MarkAttendanceScreen() {
  const { subject_id, subject_name } = useLocalSearchParams<{ subject_id: string; subject_name: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState<Record<number, AttStatus>>({});

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['class-attendance', subject_id],
    queryFn: () => fetchClassData(subject_id!),
    enabled: !!subject_id,
    onSuccess: (d: any) => {
      // Pre-fill with existing attendance for today
      const existing: Record<number, AttStatus> = {};
      d.attendance
        .filter((a: any) => a.date === selectedDate)
        .forEach((a: any) => { existing[a.student] = a.status; });
      setAttendance(existing);
    },
  } as any);

  const submitMutation = useMutation({
    mutationFn: (records: any[]) => api.post('/attendance/', records),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-attendance', subject_id] });
      Alert.alert('Saved! ✅', 'Attendance has been marked.', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to save attendance.'),
  });

  const handleSubmit = () => {
    const students: any[] = data?.enrolled_students ?? [];
    const records = students.map((s) => ({
      subject: Number(subject_id),
      student: s.id,
      date: selectedDate,
      status: attendance[s.id] ?? 'absent',
    }));
    if (!records.length) { Alert.alert('No students enrolled.'); return; }
    submitMutation.mutate(records);
  };

  const markAll = (status: AttStatus) => {
    const students: any[] = data?.enrolled_students ?? [];
    const all: Record<number, AttStatus> = {};
    students.forEach((s) => { all[s.id] = status; });
    setAttendance(all);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const students: any[] = data?.enrolled_students ?? [];
  const markedCount = Object.keys(attendance).length;

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>📋 Mark Attendance</Text>
          <Text style={styles.subjectName}>{subject_name}</Text>

          {/* Date selector (today only for now, can extend) */}
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
            <Text style={styles.dateText}>{selectedDate}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatChip label="Total" val={students.length} color={Colors.primary} />
            <StatChip label="Marked" val={markedCount} color={Colors.secondary} />
            <StatChip label="Present" val={Object.values(attendance).filter(s => s === 'present').length} color={Colors.success} />
            <StatChip label="Absent" val={Object.values(attendance).filter(s => s === 'absent').length} color={Colors.error} />
          </View>

          {/* Quick-mark all */}
          <View style={styles.quickRow}>
            <Text style={styles.quickLabel}>Mark all as:</Text>
            {STATUSES.map((s) => (
              <TouchableOpacity key={s} style={[styles.quickBtn, { borderColor: STATUS_COLORS[s] + '66' }]} onPress={() => markAll(s)}>
                <Text style={[styles.quickText, { color: STATUS_COLORS[s] }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Student list */}
          {students.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No enrolled students.</Text>
            </GlassCard>
          ) : (
            students.map((student, idx) => {
              const current = attendance[student.id];
              return (
                <GlassCard key={student.id} style={styles.studentCard}>
                  <View style={styles.studentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarLetter}>{student.name[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentUsername}>@{student.username}</Text>
                    </View>
                  </View>
                  {/* Status buttons */}
                  <View style={styles.statusRow}>
                    {STATUSES.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusBtn,
                          { borderColor: STATUS_COLORS[s] + '55' },
                          current === s && { backgroundColor: STATUS_COLORS[s] + '33', borderColor: STATUS_COLORS[s] },
                        ]}
                        onPress={() => setAttendance((prev) => ({ ...prev, [student.id]: s }))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name={STATUS_ICONS[s]} size={16} color={current === s ? STATUS_COLORS[s] : Colors.textMuted} />
                        <Text style={[styles.statusLabel, current === s && { color: STATUS_COLORS[s] }]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </GlassCard>
              );
            })
          )}

          {/* Submit */}
          {students.length > 0 && (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitMutation.isPending}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#6C63FF', '#8B4CF7']} style={styles.submitGradient}>
                {submitMutation.isPending
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="checkmark-done" size={20} color="#fff" />
                      <Text style={styles.submitText}>Save Attendance ({markedCount}/{students.length})</Text>
                    </>}
              </LinearGradient>
            </TouchableOpacity>
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function StatChip({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statVal, { color }]}>{val}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subjectName: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  datePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.md,
    backgroundColor: Colors.primary + '22', paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: Radius.full, alignSelf: 'flex-start',
  },
  dateText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  content: { padding: Spacing.base },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  statChip: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, padding: Spacing.sm },
  statVal: { fontSize: Typography.xl, fontWeight: Typography.bold },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  quickRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.base },
  quickLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  quickBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  quickText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  studentCard: { marginBottom: Spacing.sm, padding: Spacing.md },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '33', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  studentName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  studentUsername: { fontSize: Typography.xs, color: Colors.textMuted },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statusLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium, textTransform: 'capitalize' },
  submitBtn: { marginTop: Spacing.xl, borderRadius: Radius.lg, overflow: 'hidden' },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: Spacing.base },
  submitText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted },
});
