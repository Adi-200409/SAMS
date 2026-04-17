import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const fetchUsers = () => api.get('/admin/users/').then((r) => r.data);

export default function AdminUsersScreen() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users'], queryFn: fetchUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: any) => api.patch(`/admin/users/${id}/role/`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
      Alert.alert('Success', 'User role updated.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.detail ?? 'Failed to update role.'),
  });

  if (isLoading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  const users = (data ?? []).filter((u: any) => filter === 'all' || u.role === filter);

  return (
    <LinearGradient colors={['#0A0A1A', '#111128']} style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}>
        <LinearGradient colors={['#1A1A35', '#111128']} style={styles.header}>
          <Text style={styles.title}>👥 User Management</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: Spacing.md }}>
            {(['all', 'student', 'teacher', 'admin'] as const).map((t) => (
              <TouchableOpacity key={t} style={[styles.tabBtn, filter === t && styles.tabBtnActive]} onPress={() => setFilter(t)}>
                <Text style={[styles.tabLabel, filter === t && styles.tabLabelActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        <View style={styles.content}>
          {users.map((user: any) => (
            <GlassCard key={user.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}><Text style={styles.avatarLetter}>{user.username[0].toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
                  <Text style={styles.username}>@{user.username} · ID: {user.id}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                </View>
                <TouchableOpacity style={styles.roleBadge} onPress={() => setSelectedUser(user)}>
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                  <Ionicons name="pencil" size={12} color={Colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Modal visible={!!selectedUser} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Role</Text>
            <Text style={styles.modalDesc}>Change role for @{selectedUser?.username}</Text>
            <View style={{ gap: Spacing.md, marginTop: Spacing.lg }}>
              {(['student', 'teacher', 'admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, selectedUser?.role === r && styles.roleOptionActive]}
                  onPress={() => roleMutation.mutate({ id: selectedUser.id, role: r })}
                  disabled={roleMutation.isPending}
                >
                  <Text style={[styles.roleOptionText, selectedUser?.role === r && styles.roleOptionTextActive]}>
                    Make {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedUser(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 55, paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: Spacing.sm },
  tabBtnActive: { backgroundColor: Colors.primary + '33', borderWidth: 1, borderColor: Colors.primary },
  tabLabel: { fontSize: Typography.sm, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary, fontWeight: Typography.bold },
  content: { padding: Spacing.base },
  card: { padding: Spacing.base, marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.textMuted + '33', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textSecondary },
  name: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  username: { fontSize: Typography.xs, color: Colors.primary, marginVertical: 2 },
  email: { fontSize: Typography.xs, color: Colors.textMuted },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '66', backgroundColor: Colors.primary + '11' },
  roleText: { fontSize: 10, fontWeight: Typography.bold, color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: Spacing.base },
  modalCard: { backgroundColor: '#1A1A35', padding: Spacing.xl, borderRadius: Radius.xl },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  modalDesc: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 4 },
  roleOption: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  roleOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleOptionText: { color: Colors.textPrimary, fontWeight: Typography.semibold },
  roleOptionTextActive: { color: '#fff', fontWeight: Typography.bold },
  cancelBtn: { marginTop: Spacing.xl, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  cancelText: { color: Colors.textMuted, fontWeight: Typography.bold },
});
