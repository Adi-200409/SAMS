import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchRegistrations = () => api.get('/course-registration/').then((r) => r.data);

export default function AdminApprovalsScreen() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selected, setSelected] = useState<any>(null);
  const [remarks, setRemarks] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-course-registrations'], queryFn: fetchRegistrations,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, remarks }: any) => api.patch(`/course-registration/${id}/`, { status, remarks }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-course-registrations'] });
      setSelected(null);
      setRemarks('');
      Alert.alert('Success', 'Registration updated.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to update.'),
  });

  if (isLoading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  const registrations = (data ?? []).filter((r: any) => filter === 'all' || r.status === 'pending');

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}>
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>🛡️ Approvals</Text>
          <View style={styles.tabRow}>
            {(['pending', 'all'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.tabBtn, filter === t && styles.tabBtnActive]} onPress={() => setFilter(t)}>
                <Text style={[styles.tabLabel, filter === t && styles.tabLabelActive]}>{t === 'pending' ? '⏳ Pending' : 'All Requests'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {registrations.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>All caught up!</Text>
            </GlassCard>
          ) : (
            registrations.map((reg: any) => (
              <GlassCard key={reg.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{reg.student?.name} (@{reg.student?.username})</Text>
                    <Text style={styles.meta}>wants to register for</Text>
                    <Text style={styles.subjectName}>{reg.subject?.code} - {reg.subject?.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (reg.status === 'approved' ? Colors.success : reg.status === 'rejected' ? Colors.error : Colors.warning) + '22' }]}>
                    <Text style={[styles.statusText, { color: reg.status === 'approved' ? Colors.success : reg.status === 'rejected' ? Colors.error : Colors.warning }]}>{reg.status.toUpperCase()}</Text>
                  </View>
                </View>

                {reg.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.error + '22' }]} onPress={() => { setSelected(reg); setRemarks(''); }}>
                      <Text style={[styles.actionText, { color: Colors.error }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => reviewMutation.mutate({ id: reg.id, status: 'approved', remarks: 'Approved' })}>
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {reg.remarks && <Text style={styles.remarks}>Reason: {reg.remarks}</Text>}
              </GlassCard>
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Modal visible={!!selected} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Registration</Text>
            <Text style={styles.label}>Reason for rejection</Text>
            <TextInput style={styles.input} value={remarks} onChangeText={setRemarks} placeholder="Class is full..." placeholderTextColor={Colors.textMuted} multiline />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors.error }]} onPress={() => reviewMutation.mutate({ id: selected.id, status: 'rejected', remarks })}>
                {reviewMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Reject</Text>}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.base },
  tabRow: { flexDirection: 'row', gap: Spacing.sm },
  tabBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary + '33', borderWidth: 1, borderColor: Colors.primary + '66' },
  tabLabel: { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  tabLabelActive: { color: Colors.primary },
  content: { padding: Spacing.base },
  card: { padding: Spacing.base, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  studentName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  meta: { fontSize: Typography.xs, color: Colors.textMuted, marginVertical: 2 },
  subjectName: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  statusText: { fontSize: 10, fontWeight: Typography.bold },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center' },
  actionText: { fontWeight: Typography.bold, color: '#fff' },
  remarks: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: Spacing.sm, fontStyle: 'italic' },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: Spacing.base },
  modalCard: { backgroundColor: '#1A1A35', padding: Spacing.xl, borderRadius: Radius.xl },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  label: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, height: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: { flex: 1, padding: Spacing.md, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, alignItems: 'center' },
  cancelText: { color: Colors.textPrimary, fontWeight: Typography.bold },
  submitBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: Typography.bold },
});
