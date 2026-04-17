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

const fetchPlacements = () => api.get('/placement/').then((r) => r.data);

export default function AdminPlacementScreen() {
  const qc = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', description: '', placement_type: 'job', package_lpa: '', deadline: '', location: '' });

  const { data: companies, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-placement'], queryFn: fetchPlacements,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/placement/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-placement'] });
      setModalVisible(false);
      setForm({ name: '', role: '', description: '', placement_type: 'job', package_lpa: '', deadline: '', location: '' });
      Alert.alert('Success', 'Placement posted successfully.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to post.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/placement/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-placement'] }),
  });

  const handleSubmit = () => {
    if (!form.name || !form.role || !form.deadline) { Alert.alert('Error', 'Company, Role, and Deadline are required.'); return; }
    createMutation.mutate(form);
  };

  if (isLoading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}>
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>💼 Manage Placements</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Post Opportunity</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {(companies ?? []).length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No placements posted.</Text>
            </GlassCard>
          ) : (
            (companies ?? []).map((co: any) => (
              <GlassCard key={co.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.logoCircle}><Text style={styles.logoLetter}>{co.name[0]}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{co.name}</Text>
                    <Text style={styles.role}>{co.role}</Text>
                    <Text style={styles.meta}>Deadline: {new Date(co.deadline).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { Alert.alert('Confirm', 'Delete this post?', [{text: 'Cancel'}, {text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(co.id)}]); }}>
                    <Ionicons name="trash-outline" size={20} color={Colors.error} style={{ padding: 8 }} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Post Opportunity</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({...form, name: t})} placeholder="Google, Microsoft..." placeholderTextColor={Colors.textMuted} />
              <Text style={styles.label}>Role</Text>
              <TextInput style={styles.input} value={form.role} onChangeText={(t) => setForm({...form, role: t})} placeholder="Software Engineer" placeholderTextColor={Colors.textMuted} />
              
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Type (job/internship)</Text>
                  <TextInput style={styles.input} value={form.placement_type} onChangeText={(t) => setForm({...form, placement_type: t})} autoCapitalize="none" />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={styles.label}>Package (LPA)</Text>
                  <TextInput style={styles.input} value={form.package_lpa} onChangeText={(t) => setForm({...form, package_lpa: t})} keyboardType="numeric" placeholder="e.g. 15" placeholderTextColor={Colors.textMuted} />
                </View>
              </View>

              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} value={form.location} onChangeText={(t) => setForm({...form, location: t})} placeholder="Bangalore, Hybrid..." placeholderTextColor={Colors.textMuted} />
              <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={form.deadline} onChangeText={(t) => setForm({...form, deadline: t})} placeholder="2024-12-31" placeholderTextColor={Colors.textMuted} />
              
              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={(t) => setForm({...form, description: t})} placeholder="Requirements and details..." placeholderTextColor={Colors.textMuted} multiline />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Post</Text>}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '33', justifyContent: 'center', alignItems: 'center' },
  logoLetter: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  companyName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  role: { fontSize: Typography.sm, color: Colors.textSecondary, marginVertical: 2 },
  meta: { fontSize: Typography.xs, color: Colors.textMuted },
  emptyCard: { alignItems: 'center', padding: Spacing['2xl'], gap: Spacing.md },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1A1A35', margin: Spacing.base, padding: Spacing.xl, borderRadius: Radius.xl, maxHeight: '85%' },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  formRow: { flexDirection: 'row' },
  label: { fontSize: Typography.xs, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.md },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: Typography.sm },
  modalBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.md },
  cancelBtn: { flex: 1, padding: Spacing.md, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, alignItems: 'center' },
  cancelText: { color: Colors.textPrimary, fontWeight: Typography.bold },
  submitBtn: { flex: 1, padding: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.md, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: Typography.bold },
});
