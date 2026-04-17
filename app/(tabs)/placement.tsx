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

const fetchPlacements = () => api.get('/placement/').then((r) => r.data);
const fetchMyApps    = () => api.get('/placement/my-applications/').then((r) => r.data);

const STATUS_COLORS: Record<string, string> = {
  applied: Colors.info, shortlisted: Colors.warning,
  selected: Colors.success, rejected: Colors.error,
};

export default function PlacementScreen() {
  const qc = useQueryClient();
  const [tab, setTab]           = useState<'companies' | 'mine'>('companies');
  const [selected, setSelected] = useState<any>(null);
  const [resumeUrl, setResumeUrl]     = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const { data: companies, isLoading: cLoading, refetch: rC, isRefetching: rCR } = useQuery({
    queryKey: ['placement'], queryFn: fetchPlacements,
  });
  const { data: myApps, isLoading: mLoading, refetch: rM } = useQuery({
    queryKey: ['my-placement'], queryFn: fetchMyApps,
  });

  const applyMutation = useMutation({
    mutationFn: (payload: { id: number; resume_url: string; cover_letter: string }) =>
      api.post(`/placement/${payload.id}/apply/`, { resume_url: payload.resume_url, cover_letter: payload.cover_letter }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['placement'] });
      qc.invalidateQueries({ queryKey: ['my-placement'] });
      setSelected(null);
      Alert.alert('Applied! 🎉', 'Your application has been submitted.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to apply.'),
  });

  const isLoading = cLoading || mLoading;
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={rCR} onRefresh={() => { rC(); rM(); }} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>💼 Placement Portal</Text>
          <View style={styles.tabRow}>
            {(['companies', 'mine'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                  {t === 'companies' ? `🏢 Companies (${(companies ?? []).length})` : `📋 My Applications (${(myApps ?? []).length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {tab === 'companies' ? (
            (companies ?? []).length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No openings posted yet.</Text>
              </GlassCard>
            ) : (
              (companies ?? []).map((co: any) => (
                <GlassCard key={co.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.logoCircle}>
                      <Text style={styles.logoLetter}>{co.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.companyName}>{co.name}</Text>
                      <Text style={styles.role}>{co.role}</Text>
                      <View style={styles.tagRow}>
                        <Tag label={co.placement_type} color={Colors.primary} />
                        {co.package_lpa && <Tag label={`₹${co.package_lpa} LPA`} color={Colors.secondary} />}
                        {co.location && <Tag label={co.location} color={Colors.textMuted} />}
                      </View>
                    </View>
                  </View>

                  {co.description ? (
                    <Text style={styles.desc} numberOfLines={2}>{co.description}</Text>
                  ) : null}

                  <View style={styles.footerRow}>
                    <Text style={styles.deadline}>
                      ⏰ {new Date(co.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    {co.has_applied ? (
                      <View style={[styles.appliedBadge, { backgroundColor: STATUS_COLORS[co.application_status] + '22' }]}>
                        <Text style={[styles.appliedText, { color: STATUS_COLORS[co.application_status] }]}>
                          {co.application_status?.toUpperCase()}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.applyBtn} onPress={() => setSelected(co)} activeOpacity={0.8}>
                        <Text style={styles.applyText}>Apply →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassCard>
              ))
            )
          ) : (
            (myApps ?? []).length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Ionicons name="documents-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No applications yet.</Text>
              </GlassCard>
            ) : (
              (myApps ?? []).map((app: any) => (
                <GlassCard key={app.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.logoCircle}>
                      <Text style={styles.logoLetter}>{app.company?.name?.[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.companyName}>{app.company?.name}</Text>
                      <Text style={styles.role}>{app.company?.role}</Text>
                      <Text style={styles.appliedOn}>Applied {new Date(app.applied_at).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[app.status] ?? Colors.info) + '22' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[app.status] ?? Colors.info }]}>
                        {app.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {app.feedback ? <Text style={styles.feedback}>💬 {app.feedback}</Text> : null}
                </GlassCard>
              ))
            )
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Apply to {selected?.name}</Text>
            <Text style={styles.modalRole}>{selected?.role}</Text>

            <Text style={styles.modalLabel}>Resume URL (Google Drive / LinkedIn)</Text>
            <TextInput
              value={resumeUrl}
              onChangeText={setResumeUrl}
              placeholder="https://..."
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Cover Letter (optional)</Text>
            <TextInput
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder="A brief intro..."
              placeholderTextColor={Colors.textMuted}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => applyMutation.mutate({ id: selected.id, resume_url: resumeUrl, cover_letter: coverLetter })}
                disabled={applyMutation.isPending}
                activeOpacity={0.8}
              >
                {applyMutation.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.submitText}>Submit Application</Text>}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '22' }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
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
  card: { marginBottom: Spacing.md, padding: Spacing.base },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  logoCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '33', justifyContent: 'center', alignItems: 'center' },
  logoLetter: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.primary },
  companyName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  role: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  tagText: { fontSize: 10, fontWeight: Typography.semibold },
  desc: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: Spacing.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  deadline: { fontSize: Typography.xs, color: Colors.textMuted },
  applyBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.base, paddingVertical: 7, borderRadius: Radius.md },
  applyText: { color: '#fff', fontSize: Typography.sm, fontWeight: Typography.bold },
  appliedBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  appliedText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  appliedOn: { fontSize: Typography.xs, color: Colors.textMuted },
  feedback: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: Spacing.sm },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md, marginTop: Spacing.xl },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { margin: Spacing.base, padding: Spacing.xl, borderRadius: Radius.xl },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  modalRole: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.lg },
  modalLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Typography.sm,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: { flex: 1, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  cancelText: { color: Colors.textMuted, fontWeight: Typography.semibold },
  submitBtn: { flex: 2, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: Typography.bold },
});
