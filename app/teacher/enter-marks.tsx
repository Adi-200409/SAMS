import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const EXAM_TYPES = ['internal1', 'internal2', 'midterm', 'final', 'practical', 'assignment'];

export default function EnterMarksScreen() {
  const { subject_id, subject_name } = useLocalSearchParams<{ subject_id: string; subject_name: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [examType, setExamType] = useState('internal1');
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [totalMarks, setTotalMarks] = useState('100');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['class-marks', subject_id, examType],
    queryFn: () => api.get(`/marks/class/${subject_id}/?exam_type=${examType}`).then((r) => r.data),
    enabled: !!subject_id,
    onSuccess: (d: any) => {
      const existing: Record<number, string> = {};
      d.marks.forEach((m: any) => {
        existing[m.student] = m.marks_obtained.toString();
        setTotalMarks(m.total_marks.toString());
      });
      setMarks(existing);
    },
  } as any);

  const submitMutation = useMutation({
    mutationFn: (records: any[]) => api.post('/marks/', records),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['class-marks', subject_id] });
      Alert.alert('Saved! ✅', 'Marks have been recorded.', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to save marks.'),
  });

  const handleSubmit = () => {
    const students: any[] = data?.enrolled_students ?? [];
    const tMarks = parseFloat(totalMarks);
    if (isNaN(tMarks) || tMarks <= 0) {
      Alert.alert('Invalid Total', 'Please enter a valid total marks number.');
      return;
    }

    const records: any[] = [];
    students.forEach((s) => {
      const mStr = marks[s.id];
      if (mStr && mStr.trim() !== '') {
        const m = parseFloat(mStr);
        if (!isNaN(m) && m >= 0 && m <= tMarks) {
          records.push({
            subject: Number(subject_id),
            student: s.id,
            exam_type: examType,
            marks_obtained: m,
            total_marks: tMarks,
          });
        }
      }
    });

    if (!records.length) { Alert.alert('Empty', 'No valid marks entered.'); return; }
    submitMutation.mutate(records);
  };

  if (isLoading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const students: any[] = data?.enrolled_students ?? [];
  const enteredCount = Object.values(marks).filter((v) => v && v.trim() !== '').length;

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>📝 Enter Marks</Text>
          <Text style={styles.subjectName}>{subject_name}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Settings Row */}
          <GlassCard style={styles.settingsCard}>
            <Text style={styles.label}>Exam Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              <View style={styles.examCapsuleContainer}>
                  {EXAM_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.examCapsule, examType === t && styles.examCapsuleActive]}
                      onPress={() => setExamType(t)}
                    >
                      <Text style={[styles.examCapsuleText, examType === t && styles.examCapsuleTextActive]}>
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
               </View>
            </ScrollView>

            <View style={styles.totalMarksRow}>
              <Text style={styles.label}>Total Marks for this Exam</Text>
              <TextInput
                value={totalMarks}
                onChangeText={setTotalMarks}
                keyboardType="numeric"
                style={styles.totalInput}
              />
            </View>
          </GlassCard>

          {/* Student List */}
          {students.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No enrolled students.</Text>
            </GlassCard>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              <Text style={styles.listHeader}>Students ({enteredCount}/{students.length} entered)</Text>
              {students.map((student) => (
                <GlassCard key={student.id} style={styles.studentCard}>
                  <View style={styles.studentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarLetter}>{student.name[0].toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentUsername}>@{student.username}</Text>
                    </View>
                    <TextInput
                      value={marks[student.id] ?? ''}
                      onChangeText={(val) => setMarks((prev) => ({ ...prev, [student.id]: val }))}
                      keyboardType="numeric"
                      placeholder="-"
                      placeholderTextColor={Colors.textMuted}
                      style={[
                         styles.markInput,
                         marks[student.id] && parseFloat(marks[student.id]) > parseFloat(totalMarks) ? styles.markInputError : {}
                      ]}
                    />
                  </View>
                </GlassCard>
              ))}
            </View>
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
                      <Ionicons name="save" size={20} color="#fff" />
                      <Text style={styles.submitText}>Save Marks</Text>
                    </>}
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  backBtn: { marginBottom: Spacing.sm },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  subjectName: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  content: { padding: Spacing.base },
  settingsCard: { padding: Spacing.md, marginBottom: Spacing.lg },
  label: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 8, fontWeight: Typography.medium },
  examCapsuleContainer: { flexDirection: 'row', gap: Spacing.sm },
  examCapsule: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  examCapsuleActive: { backgroundColor: Colors.primary + '33', borderColor: Colors.primary },
  examCapsuleText: { fontSize: Typography.xs, color: Colors.textSecondary },
  examCapsuleTextActive: { color: Colors.primary, fontWeight: Typography.bold },
  totalMarksRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: Colors.textPrimary,
    paddingHorizontal: 12, paddingVertical: 6, width: 80, textAlign: 'center', fontWeight: 'bold'
  },
  listHeader: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted },
  studentCard: { padding: Spacing.sm },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.textMuted + '33', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textSecondary },
  studentName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  studentUsername: { fontSize: Typography.xs, color: Colors.textMuted },
  markInput: {
    backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: Radius.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    color: Colors.textPrimary, fontSize: Typography.base, fontWeight: 'bold', textAlign: 'center',
    width: 70, paddingVertical: 8,
  },
  markInputError: { borderColor: Colors.error, color: Colors.error },
  submitBtn: { marginTop: Spacing.xl, borderRadius: Radius.lg, overflow: 'hidden' },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: Spacing.base },
  submitText: { color: '#fff', fontSize: Typography.base, fontWeight: Typography.bold },
});
