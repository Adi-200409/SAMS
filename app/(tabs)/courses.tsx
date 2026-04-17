import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchSubjects = () => api.get('/subjects/').then((r) => r.data);
const fetchMyCourses = () => api.get('/course-registration/').then((r) => r.data);

export default function CoursesScreen() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'browse' | 'mine'>('browse');

  const { data: subjects, isLoading: sLoading, refetch: rS, isRefetching: rSR } = useQuery({
    queryKey: ['subjects'], queryFn: fetchSubjects,
  });
  const { data: myRegs, isLoading: mLoading, refetch: rM } = useQuery({
    queryKey: ['my-registrations'], queryFn: fetchMyCourses,
  });

  const registerMutation = useMutation({
    mutationFn: (subject_id: number) =>
      api.post('/course-registration/', { subject_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects'] });
      qc.invalidateQueries({ queryKey: ['my-registrations'] });
      Alert.alert('Registered!', 'Your registration is pending admin approval.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to register.'),
  });

  const isLoading = sLoading || mLoading;
  const filtered = (subjects ?? []).filter(
    (s: any) => s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

  const regMap: Record<number, string> = {};
  (myRegs ?? []).forEach((r: any) => { regMap[r.subject?.id] = r.status; });

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
        refreshControl={<RefreshControl refreshing={rSR} onRefresh={() => { rS(); rM(); }} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>📚 Course Registration</Text>
          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['browse', 'mine'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                  {t === 'browse' ? '🔍 Browse' : `📋 My Courses (${(myRegs ?? []).length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {tab === 'browse' ? (
            <>
              {/* Search */}
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search subjects..."
                  placeholderTextColor={Colors.textMuted}
                  style={styles.searchInput}
                />
              </View>

              {filtered.map((subj: any) => {
                const regStatus = regMap[subj.id];
                return (
                  <GlassCard key={subj.id} style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.codeRow}>
                          <Text style={styles.code}>{subj.code}</Text>
                          <Text style={styles.credits}>· {subj.credits} credits</Text>
                        </View>
                        <Text style={styles.name}>{subj.name}</Text>
                        <Text style={styles.dept}>{subj.department} · Sem {subj.semester}</Text>
                        {subj.teacher_name && (
                          <Text style={styles.teacher}>👨‍🏫 {subj.teacher_name}</Text>
                        )}
                      </View>
                      <View style={styles.rightCol}>
                        <Text style={styles.enrolled}>{subj.enrolled_count}/{subj.max_students}</Text>
                        <Text style={styles.enrolledLabel}>enrolled</Text>
                      </View>
                    </View>

                    {regStatus ? (
                      <View style={[styles.statusBadge, { backgroundColor: statusColor(regStatus) + '22' }]}>
                        <Text style={[styles.statusText, { color: statusColor(regStatus) }]}>
                          {regStatus === 'pending' ? '⏳ Pending Approval' :
                           regStatus === 'approved' ? '✅ Enrolled' : '❌ Rejected'}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.registerBtn, subj.is_full && styles.registerBtnDisabled]}
                        onPress={() => registerMutation.mutate(subj.id)}
                        disabled={subj.is_full || registerMutation.isPending}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.registerText}>
                          {subj.is_full ? 'Full' : 'Register'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </GlassCard>
                );
              })}
            </>
          ) : (
            <>
              {(myRegs ?? []).length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Ionicons name="school-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No registrations yet.</Text>
                  <Text style={styles.emptySub}>Browse subjects and register.</Text>
                </GlassCard>
              ) : (
                (myRegs ?? []).map((reg: any) => (
                  <GlassCard key={reg.id} style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.code}>{reg.subject?.code}</Text>
                        <Text style={styles.name}>{reg.subject?.name}</Text>
                        <Text style={styles.dept}>{reg.subject?.department}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor(reg.status) + '22' }]}>
                        <Text style={[styles.statusText, { color: statusColor(reg.status) }]}>
                          {reg.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    {reg.remarks ? <Text style={styles.remarks}>📝 {reg.remarks}</Text> : null}
                  </GlassCard>
                ))
              )}
            </>
          )}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function statusColor(status: string) {
  return status === 'approved' ? Colors.success : status === 'rejected' ? Colors.error : Colors.warning;
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
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.base,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: Typography.sm },
  card: { marginBottom: Spacing.md, padding: Spacing.base },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  code: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold },
  credits: { fontSize: Typography.xs, color: Colors.textMuted },
  name: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textPrimary, marginBottom: 2 },
  dept: { fontSize: Typography.xs, color: Colors.textMuted },
  teacher: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 4 },
  rightCol: { alignItems: 'center' },
  enrolled: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.secondary },
  enrolledLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, alignSelf: 'flex-start' },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  registerBtn: {
    backgroundColor: Colors.primary + '33', borderWidth: 1, borderColor: Colors.primary,
    borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center', marginTop: 4,
  },
  registerBtnDisabled: { borderColor: Colors.textMuted, backgroundColor: 'rgba(255,255,255,0.04)' },
  registerText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.primary },
  remarks: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: Spacing.sm },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md, marginTop: Spacing.xl },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },
});
