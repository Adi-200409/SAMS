import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';

const fetchAssignments = () => api.get('/assignments/').then((r) => r.data);

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22C55E', medium: '#F59E0B', high: '#EF4444', urgent: '#DC2626',
};

export default function AssignmentsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', deadline: '', priority: 'medium', estimated_hours: '2' });

  const { data: assignments, isLoading } = useQuery({ queryKey: ['assignments'], queryFn: fetchAssignments });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/assignments/', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); setShowAdd(false); },
    onError: () => Alert.alert('Error', 'Could not add assignment.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/assignments/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/assignments/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
  });

  const generatePlan = async (assignment: any) => {
    Alert.alert('🤖 Generating AI Study Plan...', 'This may take a few seconds.');
    try {
      const { data } = await api.post('/ai/study-plan/', { assignment_id: assignment.id });
      Alert.alert('📋 AI Study Plan', data.plan.substring(0, 500) + '...\n\n(Full plan saved to assignment)');
      qc.invalidateQueries({ queryKey: ['assignments'] });
    } catch {
      Alert.alert('Error', 'Could not generate study plan.');
    }
  };

  const handleAdd = () => {
    if (!form.title || !form.subject || !form.deadline) {
      Alert.alert('Error', 'Fill title, subject, and deadline.');
      return;
    }
    addMutation.mutate({
      ...form,
      deadline: new Date(form.deadline).toISOString(),
      estimated_hours: parseFloat(form.estimated_hours) || 2,
    });
  };

  if (isLoading) return <LoadingView />;

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={Colors.textSecondary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Assignments</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Ionicons name={showAdd ? 'close' : 'add'} size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {showAdd && (
        <GlassCard style={styles.addForm}>
          <Text style={styles.formTitle}>Add Assignment</Text>
          {[
            { key: 'title', placeholder: 'Assignment title' },
            { key: 'subject', placeholder: 'Subject' },
            { key: 'deadline', placeholder: 'Deadline (YYYY-MM-DD HH:MM)' },
          ].map((f) => (
            <TextInput
              key={f.key}
              style={styles.formInput}
              placeholder={f.placeholder}
              placeholderTextColor={Colors.textMuted}
              value={(form as any)[f.key]}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
            />
          ))}
          <View style={styles.priorityRow}>
            {['low', 'medium', 'high', 'urgent'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityBtn, form.priority === p && { backgroundColor: PRIORITY_COLORS[p] + '30', borderColor: PRIORITY_COLORS[p] }]}
                onPress={() => setForm((f) => ({ ...f, priority: p }))}
              >
                <Text style={[styles.priorityText, form.priority === p && { color: PRIORITY_COLORS[p] }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <GradientButton label="Add Assignment" onPress={handleAdd} loading={addMutation.isPending} style={{ marginTop: 8 }} />
        </GlassCard>
      )}

      <FlatList
        data={assignments || []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: Spacing.base, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.priorityIndicator, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.subject} · ⏰ {item.days_until_deadline}d left</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? Colors.success + '20' : Colors.warning + '20' }]}>
                <Text style={[styles.statusText, { color: item.status === 'completed' ? Colors.success : Colors.warning }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            {item.ai_study_plan && (
              <Text style={styles.planPreview} numberOfLines={2}>{item.ai_study_plan}</Text>
            )}

            <View style={styles.actionRow}>
              {item.status !== 'completed' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => updateMutation.mutate({ id: item.id, data: { status: 'completed' } })}
                >
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={[styles.actionText, { color: Colors.success }]}>Done</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={() => generatePlan(item)}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
                <Text style={[styles.actionText, { color: Colors.primary }]}>AI Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => deleteMutation.mutate(item.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={styles.emptyText}>No assignments yet</Text>
            <Text style={styles.emptySubText}>Tap + to add one</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

function LoadingView() {
  return (
    <View style={[{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 55 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  addForm: { marginHorizontal: Spacing.base, marginBottom: Spacing.md },
  formTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: Colors.glassBorder,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
    color: Colors.textPrimary, fontSize: Typography.sm, marginBottom: 8,
  },
  priorityRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  priorityBtn: {
    flex: 1, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingVertical: 6, alignItems: 'center',
  },
  priorityText: { fontSize: Typography.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  priorityIndicator: { width: 4, height: 40, borderRadius: 2 },
  cardTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  cardMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'capitalize' },
  planPreview: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: 8, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.glassBorder, paddingTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted, marginTop: 12 },
  emptySubText: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
});
