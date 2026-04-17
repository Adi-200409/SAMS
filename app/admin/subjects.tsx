import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchSubjects = () => api.get('/subjects/').then((r) => r.data);
const fetchTeachers = () => api.get('/admin/teachers/').then((r) => r.data);

export default function AdminSubjectsScreen() {
  const qc = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', department: '', semester: '1', credits: '3', max_students: '60', teacher_id: '' });

  const { data: subjects, isLoading: sLoading, refetch: rS, isRefetching } = useQuery({
    queryKey: ['admin-subjects'], queryFn: fetchSubjects,
  });
  const { data: teachers, isLoading: tLoading } = useQuery({
    queryKey: ['admin-teachers'], queryFn: fetchTeachers,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/subjects/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-subjects'] });
      setModalVisible(false);
      setForm({ code: '', name: '', department: '', semester: '1', credits: '3', max_students: '60', teacher_id: '' });
      Alert.alert('Success', 'Subject created successfully.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to create.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/subjects/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subjects'] }),
  });

  const handleSubmit = () => {
    if (!form.code || !form.name || !form.department) { Alert.alert('Error', 'Code, Name, and Department are required.'); return; }
    createMutation.mutate({
      ...form,
      semester: parseInt(form.semester) || 1,
      credits: parseInt(form.credits) || 3,
      max_students: parseInt(form.max_students) || 60,
      teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null,
    });
  };

  const isLoading = sLoading || tLoading;
  if (isLoading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={rS} tintColor={Colors.primary} />}>
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>📘 Manage Subjects</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>New Subject</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {(subjects ?? []).map((subj: any) => (
            <GlassCard key={subj.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.codeRow}>
                    <Text style={styles.code}>{subj.code}</Text>
                    {subj.is_active ? <Text style={[styles.status, { color: Colors.success }]}>Active</Text> : <Text style={[styles.status, { color: Colors.error }]}>Inactive</Text>}
                  </View>
                  <Text style={styles.name}>{subj.name}</Text>
                  <Text style={styles.meta}>{subj.department} · Sem {subj.semester} · {subj.credits} Credits</Text>
                  <Text style={styles.teacher}>Teacher: {subj.teacher_name || 'Unassigned'}</Text>
                </View>
                <TouchableOpacity onPress={() => { Alert.alert('Confirm', 'Delete this subject?', [{text: 'Cancel'}, {text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(subj.id)}]); }}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} style={{ padding: 8 }} />
                </TouchableOpacity>
              </View>
              <View style={styles.usageRow}>
                <Text style={styles.usageText}>Enrolled: <Text style={{ color: Colors.textPrimary }}>{subj.enrolled_count}/{subj.max_students}</Text></Text>
              </View>
            </GlassCard>
          ))}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Subject</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Code</Text>
                  <TextInput style={styles.input} value={form.code} onChangeText={(t) => setForm({...form, code: t})} placeholder="CS101" placeholderTextColor={Colors.textMuted} />
                </View>
                <View style={{ flex: 2, marginLeft: Spacing.sm }}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({...form, name: t})} placeholder="Intro to CS" placeholderTextColor={Colors.textMuted} />
                </View>
              </View>

              <Text style={styles.label}>Department</Text>
              <TextInput style={styles.input} value={form.department} onChangeText={(t) => setForm({...form, department: t})} placeholder="Computer Science" placeholderTextColor={Colors.textMuted} />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Semester</Text>
                  <TextInput style={styles.input} value={form.semester} onChangeText={(t) => setForm({...form, semester: t})} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginHorizontal: Spacing.sm }}>
                  <Text style={styles.label}>Credits</Text>
                  <TextInput style={styles.input} value={form.credits} onChangeText={(t) => setForm({...form, credits: t})} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Max Seats</Text>
                  <TextInput style={styles.input} value={form.max_students} onChangeText={(t) => setForm({...form, max_students: t})} keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.label}>Assign Teacher (ID)</Text>
              <Text style={styles.helpText}>Available Teachers: {(teachers??[]).map((t:any) => `${t.id}: ${t.username}`).join(', ') || 'None found'}</Text>
              <TextInput style={styles.input} value={form.teacher_id} onChangeText={(t) => setForm({...form, teacher_id: t})} placeholder="Leave blank for unassigned" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Subject</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: Typography.bold, fontSize: Typography.sm },
  content: { padding: Spacing.base },
  card: { padding: Spacing.base, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  code: { color: Colors.primary, fontWeight: Typography.bold, fontSize: Typography.sm },
  status: { fontSize: 10, fontWeight: Typography.bold, textTransform: 'uppercase' },
  name: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, marginVertical: 2 },
  meta: { fontSize: Typography.xs, color: Colors.textMuted },
  teacher: { fontSize: Typography.sm, color: Colors.secondary, marginTop: 4, fontWeight: Typography.medium },
  usageRow: { marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  usageText: { fontSize: Typography.xs, color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1A1A35', margin: Spacing.base, padding: Spacing.xl, borderRadius: Radius.xl, maxHeight: '80%' },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  formRow: { flexDirection: 'row' },
  label: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.md },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Typography.sm },
  helpText: { fontSize: 10, color: Colors.textMuted, marginBottom: 4 },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.md },
  cancelBtn: { flex: 1, padding: Spacing.md, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, alignItems: 'center' },
  cancelText: { color: Colors.textPrimary, fontWeight: Typography.bold },
  submitBtn: { flex: 1, padding: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.md, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: Typography.bold },
});
